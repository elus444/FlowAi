import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, Trash2, Eye, Database, X, AlertCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { datasetApi } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import { parseApiDate } from '@/lib/date'
import { toast } from '@/store/toastStore'
import { confirmDialog } from '@/store/confirmStore'
import type { Dataset, DatasetPreview } from '../types/dataset'

export default function Datasets() {
    const queryClient = useQueryClient()
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
    const [previewData, setPreviewData] = useState<DatasetPreview | null>(null)
    const [showPreview, setShowPreview] = useState(false)

    // Fetch datasets
    const { data: datasets, isLoading } = useQuery({
        queryKey: ['datasets'],
        queryFn: datasetApi.list
    })

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            return datasetApi.upload(file)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['datasets'] })
        },
        onError: (error: any) => {
            toast.error('Failed to upload dataset: ' + error.message)
        }
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: datasetApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['datasets'] })
            if (selectedDataset) {
                setShowPreview(false)
                setSelectedDataset(null)
            }
        },
        onError: (error: any) => {
            toast.error('Failed to delete dataset: ' + error.message)
        }
    })

    // Preview mutation
    const previewMutation = useMutation({
        mutationFn: datasetApi.getPreview,
        onSuccess: (data) => {
            setPreviewData(data)
            setShowPreview(true)
        },
        onError: (error: any) => {
            toast.error('Failed to load preview: ' + error.message)
        }
    })

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            uploadMutation.mutate(acceptedFiles[0])
        }
    }, [uploadMutation])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/json': ['.json']
        },
        maxFiles: 1
    })

    const handlePreview = (dataset: Dataset) => {
        setSelectedDataset(dataset)
        previewMutation.mutate(dataset.id)
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const ok = await confirmDialog({
            title: 'Delete dataset',
            message: 'Are you sure you want to delete this dataset? This cannot be undone.',
            confirmLabel: 'Delete',
            danger: true,
        })
        if (ok) {
            deleteMutation.mutate(id)
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="h-full flex flex-col bg-slate-950">
            {/* Header */}
            <div className="bg-slate-950 border-b border-white/10 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Datasets</h1>
                        <p className="text-slate-400 mt-1">Manage your data sources for workflows</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-hidden flex gap-8">
                {/* Left Panel: Upload & List */}
                <div className="w-1/3 flex flex-col gap-6">
                    {/* Upload Area */}
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive
                            ? 'border-emerald-400 bg-emerald-400/10'
                            : 'border-white/15 hover:border-emerald-400/40 hover:bg-white/[0.03]'
                            } ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-emerald-400/10 text-emerald-400 rounded-full">
                                <Upload size={24} />
                            </div>
                            <div>
                                <p className="font-medium text-white">
                                    {uploadMutation.isPending ? 'Uploading...' : 'Click to upload or drag and drop'}
                                </p>
                                <p className="text-sm text-slate-500 mt-1">CSV or JSON (max 10MB)</p>
                            </div>
                        </div>
                    </div>

                    {/* Dataset List */}
                    <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                            <h2 className="font-semibold text-slate-300 flex items-center gap-2">
                                <Database size={18} />
                                Your Datasets
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                                </div>
                            ) : datasets?.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No datasets yet</p>
                                </div>
                            ) : (
                                datasets?.map((dataset) => (
                                    <div
                                        key={dataset.id}
                                        onClick={() => handlePreview(dataset)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedDataset?.id === dataset.id
                                            ? 'border-emerald-400/50 bg-emerald-400/10 ring-1 ring-emerald-400/50'
                                            : 'border-white/10 hover:border-emerald-400/30 hover:bg-white/[0.04]'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
                                                    <FileText size={20} className="text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-white truncate max-w-[150px]">
                                                        {dataset.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                        <span className="uppercase bg-white/5 px-1.5 py-0.5 rounded">
                                                            {dataset.file_type}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatSize(dataset.size_bytes)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(dataset.id, e)}
                                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Preview */}
                <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm flex flex-col overflow-hidden">
                    {selectedDataset && showPreview ? (
                        <>
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FileText className="text-emerald-400" />
                                        {selectedDataset.name}
                                    </h2>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                        <span>Uploaded {formatDistanceToNow(parseApiDate(selectedDataset.created_at))} ago</span>
                                        <span>•</span>
                                        <span>{selectedDataset.row_count?.toLocaleString()} rows</span>
                                        <span>•</span>
                                        <span>{selectedDataset.columns?.length} columns</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedDataset(null)
                                        setShowPreview(false)
                                    }}
                                    className="p-2 text-slate-400 hover:bg-white/10 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-6">
                                {previewMutation.isPending ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                                    </div>
                                ) : previewData ? (
                                    <div className="border border-white/10 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-white/10">
                                            <thead className="bg-white/[0.03]">
                                                <tr>
                                                    {previewData.columns.map((col: string) => (
                                                        <th
                                                            key={col}
                                                            className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                                                        >
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                {previewData.data.map((row: Record<string, any>, i: number) => (
                                                    <tr key={i} className="hover:bg-white/[0.03]">
                                                        {previewData.columns.map((col: string) => (
                                                            <td
                                                                key={`${i}-${col}`}
                                                                className="px-6 py-4 whitespace-nowrap text-sm text-slate-400"
                                                            >
                                                                {String(row[col] ?? '')}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <AlertCircle size={48} className="mb-4 opacity-50" />
                                        <p>Failed to load preview</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <div className="p-6 bg-white/5 rounded-full mb-4">
                                <Eye size={48} className="opacity-50" />
                            </div>
                            <p className="text-lg font-medium text-slate-300">Select a dataset to preview</p>
                            <p className="text-sm mt-1">Click on any dataset from the list to view its contents</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
