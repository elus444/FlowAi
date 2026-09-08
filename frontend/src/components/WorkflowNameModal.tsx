import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface WorkflowNameModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (name: string, description: string) => void
    initialName?: string
    initialDescription?: string
    title?: string
    saveLabel?: string
}

export default function WorkflowNameModal({
    isOpen,
    onClose,
    onSave,
    initialName = '',
    initialDescription = '',
    title = 'Create Workflow',
    saveLabel = 'Create'
}: WorkflowNameModalProps) {
    const [name, setName] = useState(initialName)
    const [description, setDescription] = useState(initialDescription)

    // useState's initial value only applies on first mount -- this modal
    // stays mounted across open/close cycles (isOpen just toggles what it
    // renders), so without this, reopening with a different template's
    // initialName/initialDescription would keep showing whatever was typed
    // the first time the modal opened.
    useEffect(() => {
        if (isOpen) {
            setName(initialName)
            setDescription(initialDescription)
        }
    }, [isOpen, initialName, initialDescription])

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        onSave(name, description)
        setName('')
        setDescription('')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-slate-900 border border-white/10 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                            Workflow Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white rounded-md placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                            placeholder="My Awesome Workflow"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white rounded-md placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400/50 resize-none"
                            placeholder="What does this workflow do?"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="px-4 py-2 text-sm font-medium text-slate-950 bg-emerald-400 rounded-md hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saveLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
