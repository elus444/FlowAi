import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
    id: string
    type: ToastType
    message: string
}

interface ToastState {
    toasts: ToastItem[]
    show: (type: ToastType, message: string) => void
    dismiss: (id: string) => void
}

const DEFAULT_DURATION_MS = 5000

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],
    show: (type, message) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        set({ toasts: [...get().toasts, { id, type, message }] })
        setTimeout(() => get().dismiss(id), DEFAULT_DURATION_MS)
    },
    dismiss: (id) => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) })
    },
}))

// Convenience API so call sites read like `toast.success('Saved')` instead
// of reaching into the store directly.
export const toast = {
    success: (message: string) => useToastStore.getState().show('success', message),
    error: (message: string) => useToastStore.getState().show('error', message),
    warning: (message: string) => useToastStore.getState().show('warning', message),
    info: (message: string) => useToastStore.getState().show('info', message),
}
