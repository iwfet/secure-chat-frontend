import { create } from 'zustand';

interface LoadingState {
    isLoading: boolean;
    message: string;
    showLoader: (message?: string) => void;
    hideLoader: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
    isLoading: false,
    message: '',
    showLoader: (message = 'A processar...') => set({ isLoading: true, message }),
    hideLoader: () => set({ isLoading: false, message: '' }),
}));