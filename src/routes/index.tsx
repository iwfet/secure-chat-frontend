import {createFileRoute, redirect, useNavigate} from '@tanstack/react-router';
import { useAuthStore } from '../store/auth';
import { Box } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { useSocket } from '../hooks/useSocket';
import { ChatWindow } from '../components/ChatWindow';
import {useEffect} from "react";

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
            throw redirect({
                to: '/login',
            });
        }
    },
    component: ChatLayout,
});

function ChatLayout() {
    useSocket();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: '/login', replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
            <Sidebar />
            <ChatWindow />
        </Box>
    );
}