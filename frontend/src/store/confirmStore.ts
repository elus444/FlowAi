import { create } from 'zustand'

interface ConfirmOptions {
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
}

interface ConfirmState extends ConfirmOptions {
    isOpen: boolean
    resolve: ((value: boolean) => void) | null
    request: (options: ConfirmOptions) => Promise<boolean>
    handleConfirm: () => void
    handleCancel: () => void
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
    isOpen: false,
    title: undefined,
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    danger: false,
    resolve: null,
    request: (options) => {
        return new Promise<boolean>((resolve) => {
            set({
                isOpen: true,
                title: options.title,
                message: options.message,
                confirmLabel: options.confirmLabel ?? 'Confirm',
                cancelLabel: options.cancelLabel ?? 'Cancel',
                danger: options.danger ?? false,
                resolve,
            })
        })
    },
    handleConfirm: () => {
        get().resolve?.(true)
        set({ isOpen: false, resolve: null })
    },
    handleCancel: () => {
        get().resolve?.(false)
        set({ isOpen: false, resolve: null })
    },
}))

// confirmDialog('Delete this workflow?') returns a Promise<boolean> --
// replaces window.confirm() with a styled modal that matches the app.
export function confirmDialog(options: ConfirmOptions | string): Promise<boolean> {
    const opts = typeof options === 'string' ? { message: options } : options
    return useConfirmStore.getState().request(opts)
}
