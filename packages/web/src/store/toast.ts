import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastStore {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType) => void;
    hideToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
    toasts: [],
    showToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { id, message, type }]
        }));

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id)
            }));
        }, 3000);
    },
    hideToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
        }))
}));
