import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { exportPublicKey } from '../lib/crypto';

interface SessionState {
    publicKey: CryptoKey | null;
    privateKey: CryptoKey | null;
    socket: Socket | null;
    setKeys: (publicKey: CryptoKey, privateKey: CryptoKey) => void;
    connectSocket: (token: string, publicKey: CryptoKey) => void;
    disconnectSocket: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    publicKey: null,
    privateKey: null,
    socket: null,
    setKeys: (publicKey, privateKey) => set({ publicKey, privateKey }),
    connectSocket: async (token, publicKey) => {
        const publicKeyB64 = await exportPublicKey(publicKey);
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