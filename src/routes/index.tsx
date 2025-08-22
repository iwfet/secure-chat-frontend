import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../store/auth';
import { Box } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { useSocket } from '../hooks/useSocket';
import { ChatWindow } from '../components/ChatWindow';
import { useEffect, useState } from 'react';
import { SecurityInfoModal } from '../components/SecurityInfoModal';

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
    const [infoModalOpen, setInfoModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: '/login', replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const shouldShowInfo = sessionStorage.getItem('showSecurityInfo');
        if (shouldShowInfo === 'true') {
            setInfoModalOpen(true);
            sessionStorage.removeItem('showSecurityInfo');
        }
    }, []);

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    height: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Sidebar />
                <ChatWindow />
            </Box>
            <SecurityInfoModal
                open={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
            />
        </>
    );
}