import { create } from 'zustand'
import { Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow'
import type { WorkflowNode } from '@/types/workflow'
import type { StateField } from '@/components/StateDesigner'
import { workflowApi } from '@/services/api'
import { toast } from './toastStore'
import { parseApiDate } from '@/lib/date'

// A point-in-time copy of everything undo/redo can restore. Deep-cloned
// (via structuredClone) when captured so later mutations to the live
// nodes/edges arrays can't reach back and corrupt a saved snapshot.
interface HistorySnapshot {
  nodes: WorkflowNode[]
  edges: Edge[]
  stateSchema: StateField[]
}

const HISTORY_LIMIT = 50

interface WorkflowState {
  nodes: WorkflowNode[]
  edges: Edge[]
  selectedNode: WorkflowNode | null
  stateSchema: StateField[]  // LangGraph state schema
  name: string
  description: string
  currentWorkflowId: string | null
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean

  // Undo/redo history. `past`/`future` hold snapshots; the *current*
  // nodes/edges/stateSchema are not duplicated into either stack.
  past: HistorySnapshot[]
  future: HistorySnapshot[]

  // Actions
  setName: (name: string) => void
  setDescription: (description: string) => void
  setNodes: (nodes: WorkflowNode[]) => void
  setEdges: (edges: Edge[]) => void
  setStateSchema: (schema: StateField[]) => void
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  onConnect: (connection: Connection) => void
  addNode: (node: WorkflowNode) => void
  updateNode: (nodeId: string, data: any) => void
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void
  deleteNode: (nodeId: string) => void
  setSelectedNode: (node: WorkflowNode | null) => void
  clearWorkflow: () => void

  // Undo/redo
  pushHistory: () => void
  undo: () => void
  redo: () => void

  // Persistence
  loadWorkflow: (id: string) => Promise<void>
  saveWorkflow: () => Promise<void>
  createWorkflow: (name: string, description?: string) => Promise<string>
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  stateSchema: [],  // Initialize empty state schema
  name: 'Untitled Workflow',
  description: '',
  currentWorkflowId: null,
  isSaving: false,
  lastSaved: null,
  hasUnsavedChanges: false,

  past: [],
  future: [],

  // Snapshots the current graph onto the undo stack and clears redo (a
  // fresh edit invalidates whatever "future" undo had rewound past).
  // Call this BEFORE applying a change, so the snapshot captures the
  // state to go back to.
  pushHistory: () => {
    const { nodes, edges, stateSchema, past } = get()
    const snapshot: HistorySnapshot =
      typeof structuredClone === 'function'
        ? structuredClone({ nodes, edges, stateSchema })
        : JSON.parse(JSON.stringify({ nodes, edges, stateSchema }))
    set({
      past: [...past, snapshot].slice(-HISTORY_LIMIT),
      future: []
    })
  },

  undo: () => {
    const { past, future, nodes, edges, stateSchema } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    const current: HistorySnapshot =
      typeof structuredClone === 'function'
        ? structuredClone({ nodes, edges, stateSchema })
        : JSON.parse(JSON.stringify({ nodes, edges, stateSchema }))
    set({
      nodes: previous.nodes,
      edges: previous.edges,
      stateSchema: previous.stateSchema,
      past: past.slice(0, -1),
      future: [current, ...future],
      hasUnsavedChanges: true
    })
  },

  redo: () => {
    const { past, future, nodes, edges, stateSchema } = get()
    if (future.length === 0) return
    const next = future[0]
    const current: HistorySnapshot =
      typeof structuredClone === 'function'
        ? structuredClone({ nodes, edges, stateSchema })
        : JSON.parse(JSON.stringify({ nodes, edges, stateSchema }))
    set({
      nodes: next.nodes,
      edges: next.edges,
      stateSchema: next.stateSchema,
      past: [...past, current],
      future: future.slice(1),
      hasUnsavedChanges: true
    })
  },

  setName: (name) => set({ name, hasUnsavedChanges: true }),
  setDescription: (description) => set({ description, hasUnsavedChanges: true }),
  setNodes: (nodes) => set({ nodes, hasUnsavedChanges: true }),

  setEdges: (edges) => set({ edges, hasUnsavedChanges: true }),

  // Doesn't push history itself -- callers that use this on its own (e.g.
  // the state schema editor's Save button) should call pushHistory() first;
  // callers that replace nodes/edges/schema together (e.g. loading a
  // template) push once before the whole batch instead of once per field.
  setStateSchema: (schema) => set({ stateSchema: schema, hasUnsavedChanges: true }),

  onNodesChange: (changes) => {
    // Snapshot before removals and before a drag *finishes* (dragging:
    // false) -- not on every intermediate 'position' event mid-drag, or
    // the undo stack would fill with one entry per pixel of movement.
    // Pure selection changes don't touch graph content, so they're
    // never history-worthy.
    const isSignificant = changes.some(
      (c: any) =>
        c.type === 'remove' ||
        c.type === 'add' ||
        (c.type === 'position' && c.dragging === false)
    )
    if (isSignificant) get().pushHistory()

    set({
      nodes: applyNodeChanges(changes, get().nodes),
      hasUnsavedChanges: true
    })
  },

  onEdgesChange: (changes) => {
    const isSignificant = changes.some(
      (c: any) => c.type === 'remove' || c.type === 'add'
    )
    if (isSignificant) get().pushHistory()

    set({
      edges: applyEdgeChanges(changes, get().edges),
      hasUnsavedChanges: true
    })
  },

  onConnect: (connection) => {
    console.log('🔗 Connection attempt:', connection)

    // Validate connection
    if (!connection.source || !connection.target) {
      console.error('❌ Invalid connection: missing source or target')
      return
    }

    // Check if connection already exists
    const existingEdge = get().edges.find(
      (edge) =>
        edge.source === connection.source &&
        edge.target === connection.target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle
    )

    if (existingEdge) {
      console.warn('⚠️ Connection already exists:', existingEdge)
      return
    }

    console.log('✅ Creating edge:', connection)
    get().pushHistory()
    const newEdges = addEdge(connection, get().edges)
    console.log('📊 Total edges after adding:', newEdges.length)

    set({
      edges: newEdges,
      hasUnsavedChanges: true
    })
  },

  addNode: (node) => {
    get().pushHistory()
    set({
      nodes: [...get().nodes, node],
      hasUnsavedChanges: true
    })
  },

  updateNode: (nodeId, data) => {
    console.log('Updating node:', nodeId, 'with data:', data)
    get().pushHistory()
    const updatedNodes = get().nodes.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...data } }
        : node
    )
    console.log('Updated nodes:', updatedNodes)
    set({ nodes: updatedNodes, hasUnsavedChanges: true })
  },

  updateEdge: (edgeId, updates) => {
    console.log('Updating edge:', edgeId, 'with updates:', updates)
    get().pushHistory()
    const updatedEdges = get().edges.map((edge) =>
      edge.id === edgeId
        ? { ...edge, ...updates }
        : edge
    )
    console.log('Updated edges:', updatedEdges)
    set({ edges: updatedEdges, hasUnsavedChanges: true })
  },

  deleteNode: (nodeId) => {
    get().pushHistory()
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      hasUnsavedChanges: true
    })
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  clearWorkflow: () => set({
    nodes: [],
    edges: [],
    selectedNode: null,
    stateSchema: [],
    name: 'Untitled Workflow',
    description: '',
    currentWorkflowId: null,
    lastSaved: null,
    hasUnsavedChanges: false,
    past: [],
    future: []
  }),

  loadWorkflow: async (id) => {
    try {
      const workflow = await workflowApi.get(id)
      set({
        currentWorkflowId: workflow.id,
        name: workflow.name,
        description: workflow.description || '',
        nodes: workflow.graph_data.nodes || [],
        edges: workflow.graph_data.edges || [],
        stateSchema: workflow.graph_data.state_schema || [],
        lastSaved: parseApiDate(workflow.updated_at),
        hasUnsavedChanges: false,
        // A freshly loaded workflow starts with a clean slate -- undo
        // history from whatever was open before has nothing to do with it.
        past: [],
        future: []
      })
    } catch (error) {
      console.error('Failed to load workflow:', error)
      throw error
    }
  },

  saveWorkflow: async () => {
    const { currentWorkflowId, nodes, edges, stateSchema } = get()
    if (!currentWorkflowId) return

    set({ isSaving: true })
    try {
      const workflow = await workflowApi.update(currentWorkflowId, {
        name: get().name,
        description: get().description,
        graph_data: {
          nodes,
          edges,
          state_schema: stateSchema
        }
      })
      set({
        lastSaved: parseApiDate(workflow.updated_at),
        isSaving: false,
        hasUnsavedChanges: false
      })
    } catch (error) {
      console.error('Failed to save workflow:', error)
      set({ isSaving: false })
      toast.error(error instanceof Error ? `Failed to save: ${error.message}` : 'Failed to save workflow.')
      throw error
    }
  },

  createWorkflow: async (name, description) => {
    try {
      const workflow = await workflowApi.create({
        name,
        description,
        graph_data: { nodes: [], edges: [], state_schema: [] }
      })
      set({
        currentWorkflowId: workflow.id,
        name: workflow.name,
        description: workflow.description || '',
        nodes: [],
        edges: [],
        stateSchema: [],
        lastSaved: parseApiDate(workflow.created_at),
        hasUnsavedChanges: false,
        past: [],
        future: []
      })
      return workflow.id
    } catch (error) {
      console.error('Failed to create workflow:', error)
      throw error
    }
  }
}))
