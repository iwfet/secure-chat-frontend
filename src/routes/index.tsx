import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../store/auth';
import { Box, Typography } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { useSocket } from '../hooks/useSocket';
import {ChatWindow} from "../components/ChatWindow.tsx"; // Importe o hook

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
            throw redirect({ to: '/login' });
        }
    },
    component: ChatLayout,
});

function ChatLayout() {
    useSocket(); // Inicia a conexão do socket ao renderizar o layout

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
            <Sidebar />
            <ChatWindow />
        </Box>
    );
}