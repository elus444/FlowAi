import { useState, useEffect, useRef } from 'react'
import { useExecutionStore } from '@/store/executionStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { X, ChevronDown, ChevronUp, Terminal, AlertCircle, Info, CheckCircle, History, Play, Clock, Activity } from 'lucide-react'
import ExecutionDetails from './ExecutionDetails'
import { formatDistanceToNow } from 'date-fns'
import { parseApiDate } from '@/lib/date'

export default function ExecutionPanel() {
  const {
    executionLogs,
    isExecuting,
    currentExecutionId,
    executionHistory,
    loadHistory,
    selectedExecution,
    selectExecution,
    loadExecutionDetails,
    isLoadingHistory,
    isLoadingDetails
  } = useExecutionStore()

  const { currentWorkflowId } = useWorkflowStore()

  const [isExpanded, setIsExpanded] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Auto-switch to current tab when execution starts
  useEffect(() => {
    if (isExecuting) {
      setActiveTab('current')
      setIsExpanded(true)
      setIsMinimized(false)
    }
  }, [isExecuting])

  // Load history when tab changes to history
  useEffect(() => {
    if (activeTab === 'history' && currentWorkflowId) {
      loadHistory(currentWorkflowId)
    }
  }, [activeTab, currentWorkflowId, loadHistory])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (activeTab === 'current' && isExpanded && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [executionLogs, isExpanded, activeTab])

  // If minimized, show floating button
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-slate-950 font-semibold rounded-lg shadow-lg shadow-emerald-400/20 hover:bg-emerald-300 transition-colors"
        >
          {isExecuting ? <Activity className="w-4 h-4 animate-pulse" /> : <Terminal className="w-4 h-4" />}
          <span>
            {isExecuting ? 'Running...' : 'Execution Panel'}
          </span>
          {isExecuting && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
          )}
        </button>
      </div>
    )
  }

  // If showing details of a past execution (or fetching them -- clicking a
  // history row only has an ExecutionSummary, so the full execution incl.
  // logs still needs to be fetched before there's anything to render).
  if ((selectedExecution || isLoadingDetails) && isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[500px] h-[600px] max-h-[calc(100vh-2rem)] bg-slate-950 border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.03]">
          <span className="font-semibold text-sm text-slate-200">Execution Details</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-white/10 text-slate-300 rounded"><ChevronDown size={16} /></button>
            <button onClick={() => selectExecution(null)} className="p-1 hover:bg-white/10 text-slate-300 rounded"><X size={16} /></button>
          </div>
        </div>
        {isLoadingDetails || !selectedExecution ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400" />
          </div>
        ) : (
          <ExecutionDetails
            execution={selectedExecution}
            onClose={() => selectExecution(null)}
          />
        )}
      </div>
    )
  }

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return <AlertCircle className="w-3.5 h-3.5 text-red-400" />
      case 'warning': return <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
      case 'info': return <Info className="w-3.5 h-3.5 text-blue-400" />
      default: return <CheckCircle className="w-3.5 h-3.5 text-green-400" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return 'bg-red-500/10 border-red-500/20'
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20'
      case 'info': return 'bg-blue-500/10 border-blue-500/20'
      default: return 'bg-white/5 border-white/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} className="text-green-400" />
      case 'failed': return <AlertCircle size={14} className="text-red-400" />
      case 'running': return <Activity size={14} className="text-blue-400 animate-pulse" />
      default: return <Clock size={14} className="text-slate-500" />
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-slate-950 border border-white/10 shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-white/5"
        >
          <Terminal size={16} className="text-slate-400" />
          <span className="font-medium text-sm text-slate-200">Execution Panel</span>
          <ChevronUp size={16} className="text-slate-500" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[500px] max-h-[calc(100vh-2rem)] bg-slate-950 border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-200 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03] shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-sm text-slate-200">Execution Panel</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-white/10 rounded text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-white/10 rounded text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 shrink-0">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'current'
            ? 'bg-white/[0.04] text-emerald-400 border-b-2 border-emerald-400'
            : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
            }`}
        >
          <Play size={12} />
          Current Run
          {isExecuting && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'history'
            ? 'bg-white/[0.04] text-emerald-400 border-b-2 border-emerald-400'
            : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
            }`}
        >
          <History size={12} />
          History
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-slate-950 relative">
        {activeTab === 'current' ? (
          <div className="h-full overflow-y-auto p-3 space-y-2">
            {!currentExecutionId && executionLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-4">
                <Play size={32} className="mb-2 opacity-30" />
                <p className="text-sm text-slate-400">Ready to run</p>
                <p className="text-xs mt-1">Click "Run" in the toolbar to start execution</p>
              </div>
            ) : (
              <>
                {executionLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2.5 rounded border text-xs font-mono ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getLevelIcon(log.level)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 text-slate-500">
                          {log.node_id && (
                            <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-semibold text-slate-300">
                              {log.node_id}
                            </span>
                          )}
                          <span className="text-[10px]">
                            {parseApiDate(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-300 break-words leading-relaxed">{log.message}</p>
                        {log.data && Object.keys(log.data).length > 0 && (
                          <details className="mt-1.5">
                            <summary className="cursor-pointer text-[10px] text-emerald-400 hover:text-emerald-300 font-sans font-medium select-none">
                              View Data
                            </summary>
                            <pre className="mt-1.5 p-2 bg-black/30 rounded border border-white/10 text-[10px] overflow-x-auto text-slate-400">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
              </div>
            ) : executionHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-4">
                <History size={32} className="mb-2 opacity-30" />
                <p className="text-sm text-slate-400">No execution history</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {executionHistory.map((exec) => (
                  <button
                    key={exec.id}
                    onClick={() => loadExecutionDetails(exec.id)}
                    className="w-full text-left p-3 hover:bg-white/[0.03] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${exec.status === 'completed' ? 'bg-green-500/10' :
                        exec.status === 'failed' ? 'bg-red-500/10' : 'bg-white/5'
                        }`}>
                        {getStatusIcon(exec.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium uppercase ${exec.status === 'completed' ? 'text-green-400' :
                            exec.status === 'failed' ? 'text-red-400' : 'text-slate-300'
                            }`}>
                            {exec.status}
                          </span>
                          <span className="text-[10px] text-slate-600">•</span>
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(parseApiDate(exec.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5 font-mono">
                          ID: {exec.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={14} className="text-slate-600 -rotate-90 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
