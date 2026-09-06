import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, type ToastType } from '@/store/toastStore'

const STYLES: Record<ToastType, { icon: typeof CheckCircle2; classes: string; iconClasses: string }> = {
    success: {
        icon: CheckCircle2,
        classes: 'bg-white border-green-200',
        iconClasses: 'text-green-600',
    },
    error: {
        icon: XCircle,
        classes: 'bg-white border-red-200',
        iconClasses: 'text-red-600',
    },
    warning: {
        icon: AlertTriangle,
        classes: 'bg-white border-yellow-200',
        iconClasses: 'text-yellow-600',
    },
    info: {
        icon: Info,
        classes: 'bg-white border-blue-200',
        iconClasses: 'text-blue-600',
    },
}

export default function Toaster() {
    const { toasts, dismiss } = useToastStore()

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-2">
            {toasts.map((t) => {
                const style = STYLES[t.type]
                const Icon = style.icon
                return (
                    <div
                        key={t.id}
                        role="status"
                        className={`animate-toast-in flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${style.classes}`}
                    >
                        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClasses}`} />
                        <p className="flex-1 text-sm text-gray-800 whitespace-pre-line">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
                            aria-label="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
