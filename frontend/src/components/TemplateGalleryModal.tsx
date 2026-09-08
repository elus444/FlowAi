import { X, FilePlus2, ArrowRight } from 'lucide-react'
import { WORKFLOW_TEMPLATES, type WorkflowTemplate } from '@/templates'

interface TemplateGalleryModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectTemplate: (template: WorkflowTemplate | null) => void
}

export default function TemplateGalleryModal({ isOpen, onClose, onSelectTemplate }: TemplateGalleryModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl border border-white/10 bg-slate-900 shadow-xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-900 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Create a workflow</h2>
                        <p className="text-sm text-slate-400">Start from a template or build from scratch</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 transition-colors hover:text-slate-300"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                    <button
                        onClick={() => onSelectTemplate(null)}
                        className="group flex flex-col items-start rounded-xl border-2 border-dashed border-white/15 p-5 text-left transition-all hover:border-emerald-400/50 hover:bg-emerald-400/5"
                    >
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors group-hover:bg-emerald-400/10 group-hover:text-emerald-400">
                            <FilePlus2 size={20} />
                        </div>
                        <h3 className="font-semibold text-white">Start from scratch</h3>
                        <p className="mt-1 text-sm text-slate-400">An empty canvas. Add nodes yourself.</p>
                        <span className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
                            Continue <ArrowRight size={14} />
                        </span>
                    </button>

                    {WORKFLOW_TEMPLATES.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => onSelectTemplate(template)}
                            className="group flex flex-col items-start rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-white/[0.05]"
                        >
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 transition-colors group-hover:bg-emerald-400 group-hover:text-slate-950">
                                <template.icon size={20} />
                            </div>
                            <h3 className="font-semibold text-white">{template.name}</h3>
                            <p className="mt-1 text-sm text-slate-400 line-clamp-2">{template.description}</p>
                            <span className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
                                Use this template <ArrowRight size={14} />
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
