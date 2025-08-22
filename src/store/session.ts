import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { exportPublicKey } from '../lib/crypto'; // Importar a nova função

interface SessionState {
    publicKey: CryptoKey | null; // Alterado
    privateKey: CryptoKey | null; // Alterado
    socket: Socket | null;
    setKeys: (publicKey: CryptoKey, privateKey: CryptoKey) => void; // Alterado
    connectSocket: (token: string, publicKey: CryptoKey) => void; // Alterado
    disconnectSocket: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    publicKey: null,
    privateKey: null,
    socket: null,
    setKeys: (publicKey, privateKey) => set({ publicKey, privateKey }),
    connectSocket: async (token, publicKey) => { // Tornar a função async
        const publicKeyB64 = await exportPublicKey(publicKey); // Usar a nova função

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