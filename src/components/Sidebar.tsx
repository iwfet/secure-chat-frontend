import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Badge,
    TextField,
    CircularProgress,
    IconButton,
    Paper,
    InputAdornment,
    ListItemButton,
} from '@mui/material';
import { Search, Add, Check, Close, Logout, Refresh } from '@mui/icons-material';
import { useAuthStore } from '../store/auth';
import { useNavigate } from '@tanstack/react-router';
import api from '../api';
import type { Contact } from '../store/chat.ts';
import { useChatStore } from '../store/chat.ts';
import { useNotificationStore } from '../store/notification.ts';

interface SearchResult {
    id: string;
    username: string;
}

const getAvatarUrl = (seed: string) =>
    `https://api.dicebear.com/8.x/bottts/svg?seed=${seed}`;

export const Sidebar = () => {
    const {
        contacts,
        setContacts,
        onlineUsers,
        pendingRequests,
        setPendingRequests,
        setActiveChat,
    } = useChatStore();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const showNotification = useNotificationStore((state) => state.showNotification);

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [contactsRes, pendingRes] = await Promise.all([
                api.get('/contacts'),
                api.get('/contacts/requests/pending'),
            ]);
            setContacts(Array.isArray(contactsRes.data) ? contactsRes.data : []);
            setPendingRequests(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        } catch (error) {
            console.error('Erro ao buscar dados da sidebar:', error);
            setContacts([]);
            setPendingRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }
        try {
            setIsSearching(true);
            const res = await api.get(`/users/search?username=${query}`);
            if (user?.userId) {
                setSearchResults(
                    res.data.filter((u: SearchResult) => u.id !== user.userId),
                );
            } else {
                setSearchResults(res.data);
            }
        } catch (error) {
            console.error('Erro ao buscar utilizadores:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSendRequest = async (addresseeId: string) => {
        try {
            await api.post('/contacts/requests', { addresseeId });
            showNotification('Solicitação enviada com sucesso!', 'success');
            setSearchResults((prev) => prev.filter((user) => user.id !== addresseeId));
        } catch (error: any) {
            showNotification(
                error.response?.data?.message || 'Erro ao enviar solicitação.',
                'error',
            );
        }
    };

    const handleRequestResponse = async (
        contactId: string,
        action: 'accept' | 'reject',
    ) => {
        try {
            await api.put(`/contacts/requests/${contactId}/${action}`);
            setPendingRequests((prev) => prev.filter((req) => req.id !== contactId));
        } catch (error) {
            console.error(`Erro ao ${action} a solicitação`, error);
        }
    };

    const getContactDisplay = (contact: Contact) => {
        if (!contact || !contact.requester || !contact.addressee) {
            return { id: '', username: 'Contato Inválido' };
        }
        const otherUser =
            contact.requester.id !== user?.userId
                ? contact.requester
                : contact.addressee;
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
            <Box p={2}>
                <Typography variant="h6" gutterBottom>
                    [ Adicionar Contato ]
                </Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Buscar utilizador..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                {isSearching && <CircularProgress size={20} />}
                            </InputAdornment>
                        ),
                    }}
                />
                {searchResults.length > 0 && (
                    <Paper sx={{ mt: 1, maxHeight: 150, overflow: 'auto' }}>
                        <List dense>
                            {searchResults.map((u) => (
                                <ListItem
                                    key={u.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleSendRequest(u.id)}
                                        >
                                            <Add />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            sx={{ width: 32, height: 32 }}
                                            src={getAvatarUrl(u.username)}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText primary={u.username} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>
            <Divider />

            {Array.isArray(pendingRequests) && pendingRequests.length > 0 && (
                <>
                    <Box
                        p={2}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h6">[ Solicitações Pendentes ]</Typography>
                        <IconButton onClick={fetchData} size="small" title="Recarregar dados">
                            <Refresh />
                        </IconButton>
                    </Box>
                    <List dense sx={{ overflowY: 'auto', flexShrink: 0 }}>
                        {pendingRequests.map((req) => (
                            <ListItem
                                key={req.id}
                                secondaryAction={
                                    <>
                                        <IconButton
                                            edge="end"
                                            color="success"
                                            onClick={() => handleRequestResponse(req.id, 'accept')}
                                        >
                                            <Check />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => handleRequestResponse(req.id, 'reject')}
                                        >
                                            <Close />
                                        </IconButton>
                                    </>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{ width: 32, height: 32 }}
                                        src={getAvatarUrl(req.requester.username)}
                                    />
                                </ListItemAvatar>
                                <ListItemText primary={req.requester.username} />
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                </>
            )}

            <Box
                p={2}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h6">[ Contatos ]</Typography>
                {(!pendingRequests || pendingRequests.length === 0) && (
                    <IconButton onClick={fetchData} size="small" title="Recarregar dados">
                        <Refresh />
                    </IconButton>
                )}
            </Box>
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {loading ? (
                    <CircularProgress sx={{ mx: 'auto', mt: 4 }} />
                ) : (
                    Array.isArray(contacts) &&
                    contacts.map((contact) => {
                        const displayUser = getContactDisplay(contact);
                        if (!displayUser.id) return null;

                        const isOnline = !!onlineUsers[displayUser.id];
                        return (
                            <ListItemButton
                                key={contact.id}
                                onClick={() => setActiveChat(displayUser.id)}
                            >
                                <ListItemAvatar>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        variant="dot"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                backgroundColor: isOnline ? '#44b700' : '#888',
                                                '&::after': isOnline
                                                    ? {
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: '50%',
                                                        animation: 'ripple 1.2s infinite ease-in-out',
                                                        border: '1px solid currentColor',
                                                        content: '""',
                                                    }
                                                    : {},
                                            },
                                        }}
                                    >
                                        <Avatar
                                            alt={displayUser.username}
                                            src={getAvatarUrl(displayUser.username)}
                                        />
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText primary={displayUser.username} />
                            </ListItemButton>
                        );
                    })
                )}
            </List>
            <Divider />

            <Box p={2}>
                <Paper
                    sx={{
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            sx={{ width: 32, height: 32, mr: 1 }}
                            src={getAvatarUrl(user?.username || 'user')}
                        />
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