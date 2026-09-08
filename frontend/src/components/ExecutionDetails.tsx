import { useState } from 'react'
import { formatDuration, intervalToDuration } from 'date-fns'
import { parseApiDate } from '@/lib/date'
import {
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    Terminal,
    Database,
    Activity,
    AlertCircle,
    Info
} from 'lucide-react'
import { Execution, ExecutionLog } from '../types/workflow'

interface ExecutionDetailsProps {
    execution: Execution
    onClose: () => void
}

export default function ExecutionDetails({ execution, onClose }: ExecutionDetailsProps) {
    const [activeTab, setActiveTab] = useState<'logs' | 'data' | 'trace'>('logs')

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/30'
            case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/30'
            case 'running': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
            default: return 'text-slate-400 bg-white/5 border-white/10'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle size={18} />
            case 'failed': return <XCircle size={18} />
            case 'running': return <Activity size={18} className="animate-pulse" />
            default: return <Clock size={18} />
        }
    }

    const getLevelIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
            case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />
            case 'info': return <Info className="w-4 h-4 text-blue-500" />
            default: return <CheckCircle className="w-4 h-4 text-green-500" />
        }
    }

    // The actual run time (started_at -> completed_at), not "how long ago
    // it started" -- formatDistanceToNow(started_at) was being displayed
    // as "Duration" before, which measured against the current time
    // instead of completion and grew forever as the page stayed open.
    const durationMs = execution.started_at && execution.completed_at
        ? parseApiDate(execution.completed_at).getTime() - parseApiDate(execution.started_at).getTime()
        : null
    const duration = durationMs === null
        ? 'Unknown'
        : durationMs < 1000
            ? `${Math.max(durationMs, 0)}ms`
            : formatDuration(
                intervalToDuration({ start: 0, end: durationMs }),
                { format: ['hours', 'minutes', 'seconds'] }
            ) || '0 seconds'

    return (
        <div className="h-full flex flex-col bg-slate-950">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">Execution Details</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 border ${getStatusColor(execution.status)}`}>
                            {getStatusIcon(execution.status)}
                            <span className="uppercase">{execution.status}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {parseApiDate(execution.created_at).toLocaleString()}
                        </div>
                        {execution.completed_at && (
                            <div className="flex items-center gap-1.5">
                                <Clock size={14} />
                                Duration: {duration}
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                    Back to History
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 px-6">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs'
                            ? 'border-emerald-400 text-emerald-400'
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                >
                    <Terminal size={16} />
                    Logs
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'data'
                            ? 'border-emerald-400 text-emerald-400'
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                >
                    <Database size={16} />
                    Input / Output
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'logs' && (
                    <div className="space-y-2">
                        {execution.logs.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No logs available</div>
                        ) : (
                            execution.logs.map((log: ExecutionLog, i: number) => (
                                <div key={i} className="p-3 rounded border border-white/10 bg-white/[0.03] text-sm font-mono">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">{getLevelIcon(log.level)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                                                <span>{parseApiDate(log.timestamp).toLocaleTimeString()}</span>
                                                {log.node_id && (
                                                    <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-slate-300">
                                                        {log.node_id}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="whitespace-pre-wrap break-words text-slate-300">{log.message}</p>
                                            {log.data && (
                                                <details className="mt-2">
                                                    <summary className="cursor-pointer text-xs text-emerald-400 hover:underline">View Data</summary>
                                                    <pre className="mt-2 p-2 bg-black/30 border border-white/10 rounded text-xs overflow-x-auto text-slate-400">
                                                        {JSON.stringify(log.data, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                Input Data
                            </h3>
                            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 font-mono text-sm overflow-x-auto text-slate-300">
                                {execution.input_data ? (
                                    <pre>{JSON.stringify(execution.input_data, null, 2)}</pre>
                                ) : (
                                    <span className="text-slate-500 italic">No input data</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                Output Data
                            </h3>
                            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 font-mono text-sm overflow-x-auto text-slate-300">
                                {execution.output_data ? (
                                    <pre>{JSON.stringify(execution.output_data, null, 2)}</pre>
                                ) : (
                                    <span className="text-slate-500 italic">No output data</span>
                                )}
                            </div>
                        </div>

                        {execution.error_message && (
                            <div>
                                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Error Message
                                </h3>
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300 text-sm font-mono whitespace-pre-wrap">
                                    {execution.error_message}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
