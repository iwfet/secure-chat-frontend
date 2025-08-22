import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, IconButton } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useChatStore } from '../store/chat';
import { useSessionStore } from '../store/session';
import { useAuthStore } from '../store/auth';
import { encryptMessage } from '../lib/crypto';
import libsodium from 'libsodium-wrappers';
import {useNotificationStore} from "../store/notification.ts";

export const ChatWindow = () => {
    const { activeChatUserId, messages, addMessage, onlineUsers, contacts } = useChatStore();
    const { socket, privateKey } = useSessionStore();
    const { user } = useAuthStore();
    const [text, setText] = useState('');
    const showNotification = useNotificationStore((state) => state.showNotification);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !socket || !privateKey || !activeChatUserId || !user) return;

        const recipient = onlineUsers[activeChatUserId];
        if (!recipient) {
            showNotification('O utilizador não está online.', 'warning');
            return;
        }

        try {
            const recipientPublicKey = libsodium.from_base64(recipient.publicKey);
            const encryptedContent = await encryptMessage(text, privateKey, recipientPublicKey);

            socket.emit('sendMessage', {
                toUserId: activeChatUserId,
                encryptedContent,
            });

            addMessage(activeChatUserId, {
                id: new Date().toISOString(),
                content: text,
                isMine: true,
                timestamp: new Date().toISOString(),
            });

            setText('');
        } catch (error) {
            console.error("Erro ao criptografar ou enviar mensagem:", error);
        }
    };

    const getContactUsername = (userId: string | null) => {
        if (!userId) return '';
        const contact = contacts.find(c => {
            if (!c || !c.addressee || !c.requester) return false;
            return c.addressee.id === userId || c.requester.id === userId;
        });
        if (!contact) return userId;
        return contact.addressee.id === userId ? contact.addressee.username : contact.requester.username;
    }

    if (!activeChatUserId) {
        return (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                    [ SELECIONE UM CONTATO PARA INICIAR A COMUNICAÇÃO ]
                </Typography>
            </Box>
        );
    }

    const currentMessages = messages[activeChatUserId] || [];

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Paper elevation={3} sx={{ p: 2, borderBottom: '1px solid #333' }}>
                <Typography variant="h6">[ Chat com: {getContactUsername(activeChatUserId)} ]</Typography>
            </Paper>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column-reverse' }}>
                <Box>
                    {currentMessages.map((msg) => (
                        <Box
                            key={msg.id}
                            sx={{ display: 'flex', justifyContent: msg.isMine ? 'flex-end' : 'flex-start', mb: 1 }}
                        >
                            <Paper
                                elevation={2}
                                sx={{ p: 1.5, bgcolor: msg.isMine ? '#2e2e2e' : 'background.paper', maxWidth: '70%' }}
                            >
                                <Typography variant="body1">{msg.content}</Typography>
                            </Paper>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid #333' }} component="form" onSubmit={handleSendMessage}>
                <Paper sx={{ display: 'flex', alignItems: 'center', p: '2px 4px' }}>
                    <TextField
                        fullWidth variant="standard" placeholder="Digite sua mensagem..."
                        InputProps={{ disableUnderline: true }}
                        sx={{ ml: 1, flex: 1 }}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        autoComplete="off"
                    />
                    <IconButton type="submit" color="primary" disabled={!text.trim()}>
                        <Send />
                    </IconButton>
                </Paper>
            </Box>
        </Box>
    );
};