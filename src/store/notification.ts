import { create } from 'zustand';

type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

interface NotificationState {
    open: boolean;
    message: string;
    severity: NotificationSeverity;
    showNotification: (message: string, severity?: NotificationSeverity) => void;
    hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    open: false,
    message: '',
    severity: 'info',
    showNotification: (message, severity = 'info') => set({ message, severity, open: true }),
    hideNotification: () => set({ open: false }),
}));