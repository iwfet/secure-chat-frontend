import { useEffect } from 'react';
import { useSessionStore } from '../store/session';
import { decryptMessage } from '../lib/crypto';
import { v4 as uuidv4 } from 'uuid';
import type { Contact, Message, OnlineUser } from '../store/chat.ts';
import { useChatStore } from '../store/chat.ts';
import { useAuthStore } from '../store/auth';

interface MessagePayload {
    fromUserId: string;
    encryptedContent: string;
    createdAt: string;
}

interface NewContactPayload {
    contact: Contact;
    isOnline: boolean;
    publicKey?: string;
    socketId?: string;
}

export const useSocket = () => {
    const { socket } = useSessionStore();
    const { logout, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!socket) return;

        const handleSocketError = (error: Error) => {
            if (isAuthenticated) {
                logout();
            }
        };

        const showNotification = (title: string, body: string) => {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body, icon: '/icon-192.png' });
            }
        };

        const handleNewMessage = async (message: MessagePayload) => {
            const { privateKey } = useSessionStore.getState();
            const {
                onlineUsers,
                addMessage,
                activeChatUserId,
                incrementUnreadCount,
                contacts,
            } = useChatStore.getState();

            if (!privateKey) return;
            const sender = onlineUsers[message.fromUserId];
            if (!sender) return;

            try {
                const decryptedContent = await decryptMessage(
                    message.encryptedContent,
                    privateKey,
                    sender.publicKey,
                );
                const newMessage: Message = {
                    id: uuidv4(),
                    content: decryptedContent,
                    isMine: false,
                    timestamp: message.createdAt,
                };
                addMessage(message.fromUserId, newMessage);

                if (document.hidden || message.fromUserId !== activeChatUserId) {
                    const senderContact = contacts.find(
                        (c) =>
                            c.requester.id === message.fromUserId ||
                            c.addressee.id === message.fromUserId,
                    );
                    const senderUsername =
                        senderContact?.requester.id === message.fromUserId
                            ? senderContact?.requester.username
                            : senderContact?.addressee.username;

                    showNotification(
                        `[NOVA TRANSMISSÃO DE: ${senderUsername || 'DESCONHECIDO'}]`,
                        decryptedContent,
                    );
                }

                if (message.fromUserId !== activeChatUserId) {
                    incrementUnreadCount(message.fromUserId);
                }
            } catch (error) {
                // Silently ignore
            }
        };

        const handlePresenceUpdate = (data: {
            userId: string;
            status: 'online' | 'offline';
            publicKey?: string;
            socketId?: string;
        }) => {
            const { addOnlineUser, removeOnlineUser } = useChatStore.getState();
            if (data.status === 'online' && data.publicKey && data.socketId) {
                addOnlineUser({
                    userId: data.userId,
                    publicKey: data.publicKey,
                    socketId: data.socketId,
                });
            } else {
                removeOnlineUser(data.userId);
            }
        };

        const handleOnlineContacts = (onlineContacts: OnlineUser[]) => {
            onlineContacts.forEach(useChatStore.getState().addOnlineUser);
        };

        const handleNewContactRequest = (request: Contact) => {
            const { pendingRequests, setPendingRequests } = useChatStore.getState();
            setPendingRequests([request, ...pendingRequests]);
        };

        const handleNewContactAccepted = (payload: NewContactPayload) => {
            if (!payload || !payload.contact) return;

            const { setContacts, contacts, addOnlineUser } = useChatStore.getState();
            const { user } = useAuthStore.getState();

            setContacts([...contacts, payload.contact]);

            if (payload.isOnline && payload.publicKey && payload.socketId) {
                const selfId = user?.userId;
                if (!selfId) return;

                const newContactUserId =
                    payload.contact.requester.id === selfId
                        ? payload.contact.addressee.id
                        : payload.contact.requester.id;

                addOnlineUser({
                    userId: newContactUserId,
                    publicKey: payload.publicKey,
                    socketId: payload.socketId,
                });
            }
        };

        // Listeners de eventos normais
        socket.on('connect', () => console.log('[Socket] Conectado com ID:', socket.id));
        socket.on('disconnect', () => console.log('[Socket] Desconectado'));
        socket.on('newMessage', handleNewMessage);
        socket.on('presenceUpdate', handlePresenceUpdate);
        socket.on('onlineContacts', handleOnlineContacts);
        socket.on('newContactRequest', handleNewContactRequest);
        socket.on('newContactAccepted', handleNewContactAccepted);

        // Listeners de erro que acionam o logout
        socket.on('connect_error', handleSocketError);
        socket.on('error', handleSocketError);

        // Limpeza
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('newMessage', handleNewMessage);
            socket.off('presenceUpdate', handlePresenceUpdate);
            socket.off('onlineContacts', handleOnlineContacts);
            socket.off('newContactRequest', handleNewContactRequest);
            socket.off('newContactAccepted', handleNewContactAccepted);

            socket.off('connect_error', handleSocketError);
            socket.off('error', handleSocketError);
        };
    }, [socket, logout]);
}