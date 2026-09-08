import { Play, Brain, Globe, GitBranch, FileOutput, Database, X } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void
  // Tap-to-add fallback: native HTML5 drag-and-drop (the `draggable`
  // attribute below) does not fire on touch devices at all -- there's no
  // dragstart event, so tapping a card previously did nothing except
  // fall through to whatever gesture handling sits under it (the canvas
  // interpreting the touch as a pan/zoom). A plain click still fires
  // normally after a real drag gesture completes, so this coexists with
  // drag-and-drop rather than replacing it.
  onAddNode: (nodeType: string) => void
  // Below the md breakpoint this renders as a slide-in drawer instead of
  // an always-visible column -- a fixed 256px palette plus a fixed 384px
  // config panel as permanent flex siblings add up to more than a phone
  // is wide, which was forcing the whole page into horizontal scroll and
  // squeezing the canvas into a sliver. isOpen/onClose control the drawer;
  // both are ignored at md+ where it's back to a normal static column.
  isOpen: boolean
  onClose: () => void
}

const nodeDefinitions = [
  {
    type: 'trigger',
    label: 'Trigger',
    icon: Play,
    color: 'bg-green-500/10 border-green-500/30 text-green-400',
    description: 'Start the workflow',
  },
  {
    type: 'llm',
    label: 'LLM',
    icon: Brain,
    color: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    description: 'Call an LLM',
  },
  {
    type: 'api',
    label: 'API Call',
    icon: Globe,
    color: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    description: 'Make HTTP request',
  },
  {
    type: 'conditional',
    label: 'Conditional',
    icon: GitBranch,
    color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    description: 'Branch logic',
  },
  {
    type: 'output',
    label: 'Output',
    icon: FileOutput,
    color: 'bg-red-500/10 border-red-500/30 text-red-400',
    description: 'Final output',
  },
  {
    type: 'dataset',
    label: 'Dataset',
    icon: Database,
    color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    description: 'Load a dataset',
  },
]

export default function NodePalette({ onDragStart, onAddNode, isOpen, onClose }: NodePaletteProps) {
  // Only useful before there's anything on the canvas yet -- once the
  // workflow has nodes, showing "drag nodes onto the canvas" is stale
  // advice rather than a helpful tip.
  const hasNodes = useWorkflowStore((state) => state.nodes.length > 0)

  return (
    <>
      {/* Backdrop: mobile drawer only, tap outside to dismiss */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-slate-950 p-4 shadow-xl
          transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:z-auto md:w-64 md:shrink-0 md:translate-x-0 md:border-r
          md:border-white/10 md:shadow-none
        `}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Nodes</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 text-slate-300 rounded md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {nodeDefinitions.map((node) => {
            const Icon = node.icon
            return (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                onClick={() => {
                  onAddNode(node.type)
                  onClose()
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onAddNode(node.type)
                    onClose()
                  }
                }}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                  backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg
                  ${node.color}
                `}
              >
                <Icon className="w-5 h-5" />
                <div>
                  <div className="font-medium text-sm">{node.label}</div>
                  <div className="text-xs opacity-75">{node.description}</div>
                </div>
              </div>
            )
          })}
        </div>

        {!hasNodes && (
          <div className="mt-6 p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400">
            <p className="font-medium mb-1 text-slate-300">Tip:</p>
            <p>Drag a node onto the canvas, or tap one to add it</p>
          </div>
        )}
      </div>
    </>
  )
}
