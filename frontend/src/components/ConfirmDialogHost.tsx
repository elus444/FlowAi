import { AlertTriangle } from 'lucide-react'
import { useConfirmStore } from '@/store/confirmStore'

export default function ConfirmDialogHost() {
    const { isOpen, title, message, confirmLabel, cancelLabel, danger, handleConfirm, handleCancel } =
        useConfirmStore()

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-[1px] animate-toast-in"
            onClick={handleCancel}
        >
            <div
                className="mx-4 w-full max-w-sm rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3">
                    {danger && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                    )}
                    <div className="flex-1">
                        {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
                        <p className="mt-1 text-sm text-slate-400 whitespace-pre-line">{message}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={handleCancel}
                        className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${danger ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
