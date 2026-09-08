import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, Calendar, Play } from 'lucide-react'
import { useWorkflows, useCreateWorkflow, useDeleteWorkflow } from '../hooks/useWorkflowApi'
import WorkflowNameModal from '../components/WorkflowNameModal'
import TemplateGalleryModal from '../components/TemplateGalleryModal'
import { formatDistanceToNow } from 'date-fns'
import { parseApiDate } from '@/lib/date'
import { toast } from '@/store/toastStore'
import { confirmDialog } from '@/store/confirmStore'
import type { WorkflowTemplate } from '@/templates'

export default function WorkflowList() {
    const navigate = useNavigate()
    const { data: workflows, isLoading, error } = useWorkflows()
    const createWorkflow = useCreateWorkflow()
    const deleteWorkflow = useDeleteWorkflow()

    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const handleSelectTemplate = (template: WorkflowTemplate | null) => {
        setSelectedTemplate(template)
        setIsGalleryOpen(false)
        setIsCreateModalOpen(true)
    }

    const handleCreate = async (name: string, description: string) => {
        try {
            const newWorkflow = await createWorkflow.mutateAsync({
                name,
                description,
                graph_data: selectedTemplate
                    ? {
                        nodes: selectedTemplate.nodes,
                        edges: selectedTemplate.edges,
                        state_schema: selectedTemplate.stateSchema,
                    }
                    : { nodes: [], edges: [], state_schema: [] }
            })
            setIsCreateModalOpen(false)
            setSelectedTemplate(null)
            navigate(`/workflows/${newWorkflow.id}`)
        } catch (error) {
            console.error('Failed to create workflow:', error)
            toast.error('Failed to create workflow')
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        const ok = await confirmDialog({
            title: 'Delete workflow',
            message: 'Are you sure you want to delete this workflow? This action cannot be undone.',
            confirmLabel: 'Delete',
            danger: true,
        })
        if (ok) {
            try {
                await deleteWorkflow.mutateAsync(id)
            } catch (error) {
                console.error('Failed to delete workflow:', error)
                toast.error('Failed to delete workflow')
            }
        }
    }

    const filteredWorkflows = workflows?.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-red-400">
                <p>Error loading workflows</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-emerald-400 text-slate-950 font-medium rounded-lg hover:bg-emerald-300"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto bg-slate-950">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Workflows</h1>
                    <p className="text-slate-400 mt-1">Manage and create your AI workflows</p>
                </div>
                <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-slate-950 font-semibold rounded-lg hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-400/20"
                >
                    <Plus size={20} />
                    New Workflow
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                />
            </div>

            {/* Workflow Grid */}
            {filteredWorkflows?.length === 0 ? (
                <div className="text-center py-12 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02]">
                    <h3 className="text-lg font-medium text-white mb-2">No workflows found</h3>
                    <p className="text-slate-400 mb-6">Get started by creating your first workflow</p>
                    <button
                        onClick={() => setIsGalleryOpen(true)}
                        className="px-4 py-2 text-emerald-400 bg-emerald-400/10 rounded-lg hover:bg-emerald-400/20 transition-colors"
                    >
                        Create Workflow
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorkflows?.map((workflow) => (
                        <div
                            key={workflow.id}
                            onClick={() => navigate(`/workflows/${workflow.id}`)}
                            className="group rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 transition-all cursor-pointer hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-white/[0.06] relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-400/10 rounded-lg text-emerald-400 group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors">
                                    <Play size={24} />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleDelete(e, workflow.id)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                        title="Delete Workflow"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                {workflow.name}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2 h-10">
                                {workflow.description || 'No description provided'}
                            </p>

                            <div className="flex items-center text-xs text-slate-500 gap-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>Updated {formatDistanceToNow(parseApiDate(workflow.updated_at))} ago</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TemplateGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                onSelectTemplate={handleSelectTemplate}
            />

            <WorkflowNameModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false)
                    setSelectedTemplate(null)
                }}
                onSave={handleCreate}
                initialName={selectedTemplate?.name ?? ''}
                initialDescription={selectedTemplate?.description ?? ''}
                title={selectedTemplate ? `New workflow from "${selectedTemplate.name}"` : 'Create Workflow'}
            />
        </div>
    )
}
