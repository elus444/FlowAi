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
            <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Create a workflow</h2>
                        <p className="text-sm text-gray-500">Start from a template or build from scratch</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-500"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                    <button
                        onClick={() => onSelectTemplate(null)}
                        className="group flex flex-col items-start rounded-xl border-2 border-dashed border-gray-200 p-5 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50"
                    >
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                            <FilePlus2 size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Start from scratch</h3>
                        <p className="mt-1 text-sm text-gray-500">An empty canvas. Add nodes yourself.</p>
                        <span className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                            Continue <ArrowRight size={14} />
                        </span>
                    </button>

                    {WORKFLOW_TEMPLATES.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => onSelectTemplate(template)}
                            className="group flex flex-col items-start rounded-xl border border-gray-200 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                        >
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                <template.icon size={20} />
                            </div>
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{template.description}</p>
                            <span className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                                Use this template <ArrowRight size={14} />
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
