import { useState } from 'react'
import { X, ChevronDown, ChevronRight, Database } from 'lucide-react'

interface StateInspectorProps {
  isOpen: boolean
  onClose: () => void
  currentState: Record<string, any>
  executionHistory: Array<{
    nodeId: string
    nodeName: string
    timestamp: string
    stateSnapshot: Record<string, any>
  }>
}

export default function StateInspector({
  isOpen,
  onClose,
  currentState,
  executionHistory
}: StateInspectorProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [selectedSnapshot, setSelectedSnapshot] = useState<number | null>(null)

  if (!isOpen) return null

  const toggleKey = (key: string) => {
    const newExpanded = new Set(expandedKeys)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedKeys(newExpanded)
  }

  const renderValue = (value: any): JSX.Element => {
    // const indent = depth * 16

    if (value === null) {
      return <span className="text-slate-500">null</span>
    }

    if (value === undefined) {
      return <span className="text-slate-500">undefined</span>
    }

    if (typeof value === 'boolean') {
      return <span className="text-purple-600">{value.toString()}</span>
    }

    if (typeof value === 'number') {
      return <span className="text-emerald-400">{value}</span>
    }

    if (typeof value === 'string') {
      return (
        <span className="text-green-600">
          "{value.length > 100 ? value.substring(0, 100) + '...' : value}"
        </span>
      )
    }

    if (Array.isArray(value)) {
      return (
        <span className="text-slate-400">
          Array[{value.length}] {value.length > 0 && '...'}
        </span>
      )
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value)
      return (
        <span className="text-slate-400">
          Object {'{'}
          {keys.length}
          {'}'}
        </span>
      )
    }

    return <span className="text-slate-400">{String(value)}</span>
  }

  const displayState = selectedSnapshot !== null
    ? executionHistory[selectedSnapshot]?.stateSnapshot
    : currentState

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">State Inspector</h2>
            {selectedSnapshot !== null && (
              <span className="px-2 py-1 bg-blue-100 text-emerald-300 text-xs rounded">
                Snapshot #{selectedSnapshot + 1}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Execution History Sidebar */}
          {executionHistory.length > 0 && (
            <div className="w-64 border-r border-white/10 overflow-y-auto bg-white/[0.03]">
              <div className="p-3 border-b border-white/10 bg-slate-900">
                <h3 className="font-semibold text-sm text-slate-300">Execution History</h3>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => setSelectedSnapshot(null)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedSnapshot === null
                    ? 'bg-blue-100 text-emerald-300 font-medium'
                    : 'hover:bg-white/10'
                    }`}
                >
                  <div className="font-medium">Current State</div>
                  <div className="text-xs text-slate-500">Latest</div>
                </button>
                {executionHistory.map((entry, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSnapshot(index)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedSnapshot === index
                      ? 'bg-blue-100 text-emerald-300 font-medium'
                      : 'hover:bg-white/10'
                      }`}
                  >
                    <div className="font-medium">{entry.nodeName}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* State Display */}
          <div className="flex-1 overflow-y-auto p-6">
            {!displayState || Object.keys(displayState).length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No state data available</p>
                <p className="text-sm mt-1">Execute a workflow to see state updates</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(displayState).map(([key, value]) => (
                  <div key={key} className="border border-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleKey(key)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {expandedKeys.has(key) ? (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="font-mono font-medium text-sm">{key}</span>
                        <span className="text-xs text-slate-500">
                          {typeof value === 'object' && value !== null
                            ? Array.isArray(value)
                              ? `Array[${value.length}]`
                              : `Object{${Object.keys(value).length}}`
                            : typeof value}
                        </span>
                      </div>
                      {!expandedKeys.has(key) && (
                        <div className="text-sm truncate max-w-md">
                          {renderValue(value)}
                        </div>
                      )}
                    </button>
                    {expandedKeys.has(key) && (
                      <div className="p-4 bg-slate-900">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.03]">
          <div className="flex items-center justify-between text-sm">
            <div className="text-slate-400">
              {displayState && Object.keys(displayState).length > 0 ? (
                <>
                  <span className="font-medium">{Object.keys(displayState).length}</span> state
                  field{Object.keys(displayState).length !== 1 ? 's' : ''}
                </>
              ) : (
                'No state data'
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-400 text-slate-950 rounded-lg hover:bg-emerald-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
