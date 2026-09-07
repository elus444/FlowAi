import { useCallback, useRef, useState, DragEvent as ReactDragEvent } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  ConnectionMode,
  Edge as ReactFlowEdge,
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
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap />
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
