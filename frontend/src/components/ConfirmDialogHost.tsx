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
                className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-3">
                    {danger && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                    )}
                    <div className="flex-1">
                        {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{message}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={handleCancel}
                        className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
