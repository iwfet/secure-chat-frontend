import { useEffect } from 'react';
import { useSessionStore } from '../store/session';
import { decryptMessage } from '../lib/crypto';
import libsodium from 'libsodium-wrappers';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '../store/auth';
import type {Contact, OnlineUser} from "../store/chat.ts";
import {useChatStore} from "../store/chat.ts";

interface MessagePayload {
    fromUserId: string;
    encryptedContent: string;
    createdAt: string;
}

export const useSocket = () => {
    const { socket, privateKey } = useSessionStore();
    const { user } = useAuthStore();
    const {
        addOnlineUser,
        removeOnlineUser,
        setPendingRequests,
        onlineUsers,
        addMessage,
        setContacts,
        contacts
    } = useChatStore();

    useEffect(() => {
        if (!socket) return;

        socket.off('connect');
        socket.off('disconnect');
        socket.off('presenceUpdate');
        socket.off('onlineContacts');
        socket.off('newMessage');
        socket.off('newContactRequest');
        socket.off('newContactAccepted');

        socket.on('connect', () => console.log('[Socket] Conectado com ID:', socket.id));
        socket.on('disconnect', () => console.log('[Socket] Desconectado'));

        socket.on('presenceUpdate', (data: { userId: string; status: 'online' | 'offline'; publicKey?: string }) => {
            if (data.status === 'online' && data.publicKey) {
                addOnlineUser({ userId: data.userId, publicKey: data.publicKey });
            } else {
                removeOnlineUser(data.userId);
            }
        });

        socket.on('onlineContacts', (onlineContacts: OnlineUser[]) => {
            onlineContacts.forEach(addOnlineUser);
        });

        socket.on('newContactRequest', (request: Contact) => {
            setPendingRequests([request, ...useChatStore.getState().pendingRequests]);
        });

        socket.on('newContactAccepted', (payload: { contact: any, isOnline: boolean, publicKey?: string }) => {
            const newContact: Contact = {
                id: payload.contact.id,
                requester: user?.userId === payload.contact.id ? payload.contact : { id: user!.userId, username: user!.username },
                addressee: user?.userId !== payload.contact.id ? payload.contact : { id: user!.userId, username: user!.username },
                status: 'accepted'
            };

            setContacts([...contacts, newContact]);

            if (payload.isOnline && payload.publicKey) {
                addOnlineUser({ userId: payload.contact.id, publicKey: payload.publicKey });
            }
        });

        socket.on('newMessage', async (message: MessagePayload) => {
            if (!privateKey) return;

            const sender = onlineUsers[message.fromUserId];
            if (!sender) return;

            try {
                const senderPublicKey = libsodium.from_base64(sender.publicKey);
                const decryptedContent = await decryptMessage(message.encryptedContent, privateKey, senderPublicKey);
                addMessage(message.fromUserId, {
                    id: uuidv4(),
                    content: decryptedContent,
                    isMine: false,
                    timestamp: message.createdAt,
                });
            } catch (error) {
                console.error("Falha ao descriptografar a mensagem:", error);
            }
        });

    }, [socket, privateKey, onlineUsers, addMessage, addOnlineUser, removeOnlineUser, setPendingRequests, contacts, setContacts, user]);
};