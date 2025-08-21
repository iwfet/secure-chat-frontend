import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SessionState {
    publicKey: Uint8Array | null;
    privateKey: Uint8Array | null;
    socket: Socket | null;
    setKeys: (publicKey: Uint8Array, privateKey: Uint8Array) => void;
    connectSocket: (token: string, publicKey: Uint8Array) => void;
    disconnectSocket: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    publicKey: null,
    privateKey: null,
    socket: null,
    setKeys: (publicKey, privateKey) => set({ publicKey, privateKey }),
    connectSocket: (token, publicKey) => {
        // Converte a chave pública para um formato enviável (Base64)
        const publicKeyB64 = btoa(String.fromCharCode.apply(null, Array.from(publicKey)));

        const newSocket = io('http://localhost:5000', {
            auth: {
                token,
                publicKey: publicKeyB64,
            },
        });
        set({ socket: newSocket });
    },
    disconnectSocket: () => {
        set((state) => {
            state.socket?.disconnect();
            return { socket: null, publicKey: null, privateKey: null };
        });
    },
}));