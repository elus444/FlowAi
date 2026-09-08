import { useCallback, useEffect, useRef, useState, DragEvent as ReactDragEvent } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  ConnectionMode,
  Edge as ReactFlowEdge,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { nodeTypes } from './nodes'
import { edgeTypes } from './edges'
import { useWorkflowStore } from '@/store/workflowStore'
import ConditionalEdgeConfig from './ConditionalEdgeConfig'
import type { WorkflowNode } from '@/types/workflow'
import type { ConditionalEdgeData } from '@/types/conditional'
import { getNodeId, getNodeTypeLabel } from '@/lib/nodeIds'

function WorkflowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
    stateSchema,
    updateEdge,
  } = useWorkflowStore()

  const [showConditionalConfig, setShowConditionalConfig] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState<ReactFlowEdge | null>(null)
  const reactFlowInstance = useReactFlow()

  // Tap-to-add (NodePalette, for touch devices) places new nodes at fixed
  // grid coordinates near the origin with no idea what part of the canvas
  // is actually in view -- if the user had panned/zoomed away, or enough
  // nodes had already piled up, the new node landed off-screen with
  // nothing indicating where. Desktop drag-and-drop already drops the
  // node under the cursor (visible by construction), so this only needs
  // to act when a node was added WITHOUT a corresponding drag, which we
  // can't observe directly -- instead, react to exactly one node being
  // appended (bulk template loads change the count by more than one, and
  // that's what the canvas's own `fitView` prop is already for) and pan
  // to it only if it isn't already visible.
  const hasMountedRef = useRef(false)
  const prevNodeCountRef = useRef(nodes.length)
  useEffect(() => {
    const prevCount = prevNodeCountRef.current
    prevNodeCountRef.current = nodes.length

    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    if (nodes.length !== prevCount + 1) return

    const newest = nodes[nodes.length - 1]
    const bounds = reactFlowWrapper.current?.getBoundingClientRect()
    if (!bounds) return

    const { x: panX, y: panY, zoom } = reactFlowInstance.getViewport()
    // Approximate the node's center (not just its top-left position) so
    // the visibility check and the pan target both line up with what the
    // user actually sees.
    const nodeCenterX = newest.position.x + 90
    const nodeCenterY = newest.position.y + 30
    const screenX = nodeCenterX * zoom + panX
    const screenY = nodeCenterY * zoom + panY

    const margin = 60
    const isVisible =
      screenX > margin &&
      screenX < bounds.width - margin &&
      screenY > margin &&
      screenY < bounds.height - margin

    if (!isVisible) {
      reactFlowInstance.setCenter(nodeCenterX, nodeCenterY, {
        zoom: Math.max(zoom, 0.75),
        duration: 300,
      })
    }
  }, [nodes, reactFlowInstance])

  const onDragOver = useCallback((event: ReactDragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: ReactDragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type) {
        return
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds) return

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const id = getNodeId(type)
      const newNode: WorkflowNode = {
        id,
        type,
        position,
        data: {
          // id is "<type>_<n>" -- reuse that same n in the label instead
          // of tracking a second counter.
          label: `${getNodeTypeLabel(type)} ${id.split('_').pop()}`,
        },
      }

      addNode(newNode)
    },
    [addNode]
  )

  const onNodeClick = useCallback(
    (_event: any, node: WorkflowNode) => {
      setSelectedNode(node)
    },
    [setSelectedNode]
  )

  const onEdgeDoubleClick = useCallback(
    (_event: any, edge: ReactFlowEdge) => {
      setSelectedEdge(edge)
      setShowConditionalConfig(true)
    },
    []
  )

  const handleSaveConditionalRouting = useCallback(
    (data: ConditionalEdgeData) => {
      if (!selectedEdge) return

      // Update the edge with conditional data
      const updatedEdge = {
        ...selectedEdge,
        type: 'conditional',
        data,
        label: data.routes.length > 0 ? data.routes[0].label : 'Conditional'
      }

      updateEdge(selectedEdge.id, updatedEdge)
      setShowConditionalConfig(false)
      setSelectedEdge(null)
    },
    [selectedEdge, updateEdge]
  )

  return (
    <>
      <div ref={reactFlowWrapper} className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onEdgeDoubleClick={onEdgeDoubleClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
          }}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          deleteKeyCode={['Delete', 'Backspace']}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color="#334155"
            style={{ backgroundColor: '#020617' }}
          />
          <Controls />
          <MiniMap
            nodeColor="#1e293b"
            nodeStrokeColor="#475569"
            maskColor="rgba(2, 6, 23, 0.7)"
          />
        </ReactFlow>
      </div>

      {/* Conditional Edge Config Modal */}
      {selectedEdge && (
        <ConditionalEdgeConfig
          isOpen={showConditionalConfig}
          onClose={() => {
            setShowConditionalConfig(false)
            setSelectedEdge(null)
          }}
          sourceNodeId={selectedEdge.source}
          currentTarget={selectedEdge.target}
          availableNodes={nodes}
          stateSchema={stateSchema}
          initialData={selectedEdge.data as ConditionalEdgeData | undefined}
          onSave={handleSaveConditionalRouting}
        />
      )}
    </>
  )
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  )
}
