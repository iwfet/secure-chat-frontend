import { create } from 'zustand';
import { useSessionStore } from './session';
import { jwtDecode } from 'jwt-decode';
import {useChatStore} from "./chat.ts";

interface UserPayload {
    userId: string;
    username: string;
}

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: UserPayload | null;
    login: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    isAuthenticated: false,
    user: null,
    login: (token) => {
        try {
            const decoded: { sub: string, username: string } = jwtDecode(token);
            const userPayload: UserPayload = {
                userId: decoded.sub,
                username: decoded.username,
            };
            set({ token, isAuthenticated: true, user: userPayload });
        } catch (error) {
            console.error("Token JWT inválido:", error);
            set({ token: null, isAuthenticated: false, user: null });
        }
    },
    logout: () => {
        useSessionStore.getState().disconnectSocket();
        useChatStore.getState().clearChatState();
        set({ token: null, isAuthenticated: false, user: null });
    },
}));