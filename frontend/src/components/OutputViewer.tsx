import { useState } from 'react'
import { X, Download, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface OutputViewerProps {
  isOpen: boolean
  onClose: () => void
  executionData: {
    id: string
    status: string
    output_data?: any
    error_message?: string
    started_at?: string
    completed_at?: string
  } | null
}

export default function OutputViewer({ isOpen, onClose, executionData }: OutputViewerProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'json' | 'raw'>('formatted')
  const [copied, setCopied] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['analysis']))

  if (!isOpen || !executionData) return null

  const output = executionData.output_data?.data || executionData.output_data || {}

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workflow-output-${executionData.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSections(newExpanded)
  }

  const renderFormattedOutput = () => {
    // Check if output has common keys we can format nicely
    const keys = Object.keys(output)

    if (keys.length === 0) {
      return (
        <div className="text-center py-12 text-slate-500">
          <p>No output data available</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {keys.map((key) => {
          const value = output[key]
          const isExpanded = expandedSections.has(key)

          return (
            <div key={key} className="border border-white/10 rounded-lg overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-semibold text-white capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {typeof value === 'string' ? `${value.length} chars` : typeof value}
                </span>
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="p-4 bg-slate-900">
                  {typeof value === 'string' ? (
                    // Try to render as markdown if it looks like formatted text
                    value.includes('\n') || value.includes('#') || value.includes('**') ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{value}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-slate-300">{value}</p>
                    )
                  ) : typeof value === 'object' ? (
                    <pre className="bg-white/[0.03] p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-slate-300">{String(value)}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold">Workflow Output</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                executionData.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : executionData.status === 'failed'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {executionData.status}
              </span>
              {executionData.completed_at && (
                <span className="text-xs text-slate-500">
                  {new Date(executionData.completed_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-white/10 rounded"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/10 rounded"
              title="Download JSON"
            >
              <Download className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-white/10 bg-white/[0.03]">
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'formatted'
                ? 'bg-slate-900 text-emerald-400 shadow'
                : 'text-slate-400 hover:bg-white/10'
            }`}
          >
            Formatted
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'json'
                ? 'bg-slate-900 text-emerald-400 shadow'
                : 'text-slate-400 hover:bg-white/10'
            }`}
          >
            JSON
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 rounded text-sm ${
              viewMode === 'raw'
                ? 'bg-slate-900 text-emerald-400 shadow'
                : 'text-slate-400 hover:bg-white/10'
            }`}
          >
            Raw
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {executionData.status === 'failed' && executionData.error_message ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Error</h3>
              <p className="text-red-700 text-sm">{executionData.error_message}</p>
            </div>
          ) : viewMode === 'formatted' ? (
            renderFormattedOutput()
          ) : viewMode === 'json' ? (
            <pre className="bg-white/[0.03] p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(output, null, 2)}
            </pre>
          ) : (
            <pre className="bg-white/[0.03] p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(output)}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.03] flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Execution ID: <code className="bg-white/10 text-slate-300 px-1 rounded">{executionData.id}</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 text-slate-200 rounded-md hover:bg-white/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
