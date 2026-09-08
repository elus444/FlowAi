import { useEffect, useState, DragEvent } from 'react'
import { useParams } from 'react-router-dom'
import { ReactFlowProvider } from 'reactflow'
import { LayoutGrid } from 'lucide-react'
import NodePalette from '../components/NodePalette'
import WorkflowCanvas from '../components/WorkflowCanvas'
import NodeConfigPanel from '../components/NodeConfigPanel'
import Toolbar from '../components/Toolbar'
import ExecutionPanel from '../components/ExecutionPanel'
import UnsavedChangesDialog from '../components/UnsavedChangesDialog'
import { useWorkflowStore } from '../store/workflowStore'
import { getNodeId, getNodeTypeLabel } from '../lib/nodeIds'
import type { WorkflowNode } from '../types/workflow'

export default function Dashboard() {
    const { id } = useParams<{ id: string }>()
    const { loadWorkflow, clearWorkflow, currentWorkflowId, hasUnsavedChanges, nodes, addNode } = useWorkflowStore()
    // The node palette is a permanent column at md+ but a toggled drawer
    // below it (see NodePalette) -- this only controls the drawer state.
    const [isPaletteOpen, setIsPaletteOpen] = useState(false)

    useEffect(() => {
        if (id) {
            loadWorkflow(id)
        } else {
            clearWorkflow()
        }

        return () => {
            clearWorkflow()
        }
    }, [id, loadWorkflow, clearWorkflow])

    const onDragStart = (event: DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType)
        event.dataTransfer.effectAllowed = 'move'
    }

    // Tap-to-add: the only way to place a node on touch devices, since
    // native HTML5 drag-and-drop (used by onDragStart above) never fires
    // there. Lands new nodes in a simple cascading grid near the origin --
    // fitView only runs once on initial mount, not per-addition, so
    // dropping them near where an empty canvas is already centered keeps
    // them visible without needing viewport math shared across the
    // NodePalette/WorkflowCanvas split.
    const onAddNode = (nodeType: string) => {
        const count = nodes.length
        const col = count % 4
        const row = Math.floor(count / 4)
        const id = getNodeId(nodeType)
        const newNode: WorkflowNode = {
            id,
            type: nodeType,
            position: { x: 100 + col * 220, y: 100 + row * 140 },
            data: {
                label: `${getNodeTypeLabel(nodeType)} ${id.split('_').pop()}`,
            },
        }
        addNode(newNode)
    }

    if (id && !currentWorkflowId) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-slate-950">
            <UnsavedChangesDialog isDirty={hasUnsavedChanges} />
            <Toolbar />
            <div className="flex-1 flex overflow-hidden relative">
                <ReactFlowProvider>
                    <NodePalette
                        onDragStart={onDragStart}
                        onAddNode={onAddNode}
                        isOpen={isPaletteOpen}
                        onClose={() => setIsPaletteOpen(false)}
                    />
                    {/* Opens the node drawer below md, where NodePalette is
                        hidden off-canvas by default instead of taking up
                        a quarter of a phone screen permanently. */}
                    <button
                        onClick={() => setIsPaletteOpen(true)}
                        className="md:hidden absolute left-3 top-3 z-30 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 shadow-md"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Nodes
                    </button>
                    <WorkflowCanvas />
                    <NodeConfigPanel />
                </ReactFlowProvider>
            </div>
            <ExecutionPanel />
        </div>
    )
}
