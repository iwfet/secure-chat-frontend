import  { useState, useEffect } from 'react';
import {
    Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Badge, TextField,
    CircularProgress, IconButton, Paper, InputAdornment
} from '@mui/material';
import { Search, Add, Check, Close, Logout } from '@mui/icons-material';
import { useAuthStore } from '../store/auth'; // A importação mais importante para esta correção
import { useNavigate } from '@tanstack/react-router';
import api from '../api';
import type {Contact} from "../store/chat.ts";
import {useChatStore} from "../store/chat.ts";

// Interface para os resultados da busca de utilizadores
interface SearchResult {
    id: string;
    username: string;
}

// Função para gerar um URL de avatar com base no nome do utilizador
const getAvatarUrl = (seed: string) => `https://api.dicebear.com/8.x/bottts/svg?seed=${seed}`;

export const Sidebar = () => {
    const {
        contacts, setContacts, onlineUsers, pendingRequests,
        setPendingRequests, setActiveChat
    } = useChatStore();

    // CORREÇÃO: Obter o utilizador logado (incluindo o ID) do estado de autenticação
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Efeito para buscar os dados iniciais (contactos e solicitações)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [contactsRes, pendingRes] = await Promise.all([
                    api.get('/contacts'),
                    api.get('/contacts/requests/pending'),
                ]);
                setContacts(Array.isArray(contactsRes.data) ? contactsRes.data : []);
                setPendingRequests(Array.isArray(pendingRes.data) ? pendingRes.data : []);
            } catch (error) {
                console.error("Erro ao buscar dados da sidebar:", error);
                setContacts([]);
                setPendingRequests([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setContacts, setPendingRequests]);

    // Função para buscar utilizadores na API
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }
        try {
            setIsSearching(true);
            const res = await api.get(`/users/search?username=${query}`);
            // CORREÇÃO: Filtra os resultados para não mostrar o próprio utilizador logado
            if (user?.userId) {
                setSearchResults(res.data.filter((u: SearchResult) => u.id !== user.userId));
            } else {
                setSearchResults(res.data);
            }
        } catch (error) {
            console.error('Erro ao buscar utilizadores:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Função para enviar uma solicitação de contacto
    const handleSendRequest = async (addresseeId: string) => {
        try {
            await api.post('/contacts/requests', { addresseeId });
            alert('Solicitação enviada com sucesso!');
            setSearchResults(prev => prev.filter(user => user.id !== addresseeId));
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao enviar solicitação.');
        }
    };

    // Função para aceitar ou rejeitar uma solicitação
    const handleRequestResponse = async (contactId: string, action: 'accept' | 'reject') => {
        try {
            await api.put(`/contacts/requests/${contactId}/${action}`);
            const respondedRequest = pendingRequests.find(req => req.id === contactId);
            setPendingRequests(prev => prev.filter(req => req.id !== contactId));
            if (action === 'accept' && respondedRequest) {
                setContacts([...contacts, { ...respondedRequest, status: 'accepted' }]);
            }
        } catch (error) {
            console.error(`Erro ao ${action} a solicitação`, error);
        }
    };

    // Helper para extrair os dados do outro utilizador num objeto de contacto
    const getContactDisplay = (contact: Contact) => {
        // CORREÇÃO: Usa o ID do utilizador logado para determinar quem é o "outro" no contacto.
        const otherUser = contact.requester.id !== user?.userId ? contact.requester : contact.addressee;
        return {
            id: otherUser.id,
            username: otherUser.username,
        };
    };

    const handleLogout = () => {
        logout();
        navigate({ to: '/login' });
    };

    return (
        <Box
            sx={{
                width: 320,
                height: '100vh',
                bgcolor: 'background.paper',
                borderRight: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* --- SEÇÃO DE BUSCA --- */}
            <Box p={2}>
                <Typography variant="h6" gutterBottom>[ Adicionar Contato ]</Typography>
                <TextField
                    fullWidth variant="outlined" size="small" placeholder="Buscar utilizador..."
                    value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>),
                        endAdornment: (<InputAdornment position="end">{isSearching && <CircularProgress size={20} />}</InputAdornment>)
                    }}
                />
                {searchResults.length > 0 && (
                    <Paper sx={{ mt: 1, maxHeight: 150, overflow: 'auto' }}>
                        <List dense>
                            {searchResults.map(u => (
                                <ListItem key={u.id} secondaryAction={
                                    <IconButton edge="end" onClick={() => handleSendRequest(u.id)}><Add /></IconButton>
                                }>
                                    <ListItemAvatar><Avatar sx={{ width: 32, height: 32 }} src={getAvatarUrl(u.username)} /></ListItemAvatar>
                                    <ListItemText primary={u.username} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>
            <Divider />

            {/* --- SEÇÃO DE SOLICITAÇÕES PENDENTES --- */}
            {Array.isArray(pendingRequests) && pendingRequests.length > 0 && (
                <>
                    <Box p={2}><Typography variant="h6">[ Solicitações Pendentes ]</Typography></Box>
                    <List dense sx={{ overflowY: 'auto', flexShrink: 0 }}>
                        {pendingRequests.map(req => (
                            <ListItem key={req.id} secondaryAction={
                                <>
                                    <IconButton edge="end" color="success" onClick={() => handleRequestResponse(req.id, 'accept')}><Check /></IconButton>
                                    <IconButton edge="end" color="error" onClick={() => handleRequestResponse(req.id, 'reject')}><Close /></IconButton>
                                </>
                            }>
                                <ListItemAvatar><Avatar sx={{ width: 32, height: 32 }} src={getAvatarUrl(req.requester.username)} /></ListItemAvatar>
                                <ListItemText primary={req.requester.username} />
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                </>
            )}

            {/* --- SEÇÃO DE CONTATOS --- */}
            <Box p={2}><Typography variant="h6">[ Contatos ]</Typography></Box>
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {loading ? <CircularProgress sx={{ mx: 'auto', mt: 4 }} /> : (Array.isArray(contacts) && contacts.map((contact) => {
                    const displayUser = getContactDisplay(contact);
                    const isOnline = !!onlineUsers[displayUser.id];
                    return (
                        <ListItem button key={contact.id} onClick={() => setActiveChat(displayUser.id)}>
                            <ListItemAvatar>
                                <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot"
                                       sx={{
                                           '& .MuiBadge-badge': {
                                               backgroundColor: isOnline ? '#44b700' : '#888',
                                               '&::after': isOnline ? {
                                                   position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                   borderRadius: '50%', animation: 'ripple 1.2s infinite ease-in-out',
                                                   border: '1px solid currentColor', content: '""',
                                               } : {}
                                           }
                                       }}>
                                    <Avatar alt={displayUser.username} src={getAvatarUrl(displayUser.username)} />
                                </Badge>
                            </ListItemAvatar>
                            <ListItemText primary={displayUser.username} />
                        </ListItem>
                    )
                }))}
            </List>
            <Divider />

            {/* --- SEÇÃO DO UTILIZADOR E LOGOUT --- */}
            <Box p={2}>
                <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1 }} src={getAvatarUrl(user?.username || 'user')} />
                        <Typography>{user?.username}</Typography>
                    </Box>
                    <IconButton title="Logout" onClick={handleLogout}>
                        <Logout />
                    </IconButton>
                </Paper>
            </Box>
        </Box>
    );
};