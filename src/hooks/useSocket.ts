import { useEffect } from 'react';
import { useSessionStore } from '../store/session';
import { decryptMessage } from '../lib/crypto';
import libsodium from 'libsodium-wrappers';
import { v4 as uuidv4 } from 'uuid';
import type {Contact, OnlineUser} from "../store/chat.ts";
import {useChatStore} from "../store/chat.ts";

// Define a estrutura do payload de uma mensagem recebida
interface MessagePayload {
    fromUserId: string;
    encryptedContent: string;
    createdAt: string;
}

/**
 * Hook customizado para gerenciar todos os eventos do Socket.IO.
 * Ele obtém o socket da `sessionStore` e anexa os listeners.
 */
export const useSocket = () => {
    const { socket, privateKey } = useSessionStore();
    const {
        addOnlineUser,
        removeOnlineUser,
        setPendingRequests,
        onlineUsers,
        addMessage
    } = useChatStore();

    useEffect(() => {
        // Se não houver um socket ativo, não faz nada.
        if (!socket) {
            return;
        }

        // Limpa listeners antigos para evitar duplicação em caso de re-renderização.
        socket.off('connect');
        socket.off('disconnect');
        socket.off('presenceUpdate');
        socket.off('onlineContacts');
        socket.off('newMessage');
        socket.off('newContactRequest');

        // --- Configuração dos Listeners de Eventos ---

        socket.on('connect', () => console.log('[Socket] Conectado com ID:', socket.id));
        socket.on('disconnect', () => console.log('[Socket] Desconectado'));

        socket.on('presenceUpdate', (data: { userId: string; status: 'online' | 'offline'; publicKey?: string }) => {
            if (data.status === 'online' && data.publicKey) {
                addOnlineUser({ userId: data.userId, publicKey: data.publicKey });
                console.log(`[Socket] Utilizador ${data.userId} está online.`);
            } else {
                removeOnlineUser(data.userId);
                console.log(`[Socket] Utilizador ${data.userId} está offline.`);
            }
        });

        socket.on('onlineContacts', (onlineContacts: OnlineUser[]) => {
            console.log('[Socket] Contatos online recebidos:', onlineContacts);
            onlineContacts.forEach(addOnlineUser);
        });

        socket.on('newContactRequest', (request: Contact) => {
            console.log('[Socket] Nova solicitação de contato recebida:', request);
            // Adiciona a nova solicitação no topo da lista no estado global
            setPendingRequests([request, ...useChatStore.getState().pendingRequests]);
        });

        socket.on('newMessage', async (message: MessagePayload) => {
            console.log('[Socket] Nova mensagem criptografada recebida:', message);

            if (!privateKey) {
                console.error("Erro: Chave privada não encontrada para descriptografar a mensagem.");
                return;
            }

            const sender = onlineUsers[message.fromUserId];
            if (!sender) {
                console.error("Erro: Não foi possível encontrar a chave pública do remetente. Ele pode ter ficado offline.");
                return;
            }

            try {
                // Converte a chave pública do remetente de Base64 para o formato necessário
                const senderPublicKey = libsodium.from_base64(sender.publicKey);

                // Descriptografa o conteúdo
                const decryptedContent = await decryptMessage(message.encryptedContent, privateKey, senderPublicKey);

                // Adiciona a mensagem descriptografada ao estado global
                addMessage(message.fromUserId, {
                    id: uuidv4(), // Gera um ID único para a chave do React
                    content: decryptedContent,
                    isMine: false, // A mensagem recebida nunca é "minha"
                    timestamp: message.createdAt,
                });
            } catch (error) {
                console.error("Falha ao descriptografar a mensagem:", error);
            }
        });

    }, [socket, privateKey, onlineUsers, addMessage, addOnlineUser, removeOnlineUser, setPendingRequests]);
};