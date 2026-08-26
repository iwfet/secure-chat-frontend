import { useState, useEffect } from 'react';
import { Modal, Box, Typography, CircularProgress } from '@mui/material';
import { useSessionStore } from '../store/session';
import { useChatStore } from '../store/chat';
import { generateSafetyNumber } from '../lib/crypto';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #fff',
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
};

interface VerificationModalProps {
    open: boolean;
    onClose: () => void;
}

export const VerificationModal = ({ open, onClose }: VerificationModalProps) => {
    const { publicKey } = useSessionStore();
    const { activeChatUserId, onlineUsers } = useChatStore();
    const [safetyNumber, setSafetyNumber] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateFingerprint = async () => {
            if (!publicKey || !activeChatUserId || !onlineUsers[activeChatUserId]) {
                return;
            }
            setLoading(true);
            const theirPublicKeyB64 = onlineUsers[activeChatUserId].publicKey;
            const number = await generateSafetyNumber(publicKey, theirPublicKeyB64);
            setSafetyNumber(number);
            setLoading(false);
        };

        if (open) {
            calculateFingerprint();
        }
    }, [open, publicKey, activeChatUserId, onlineUsers]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" gutterBottom>
                    [ Número de Segurança ]
                </Typography>
                <Typography sx={{ mt: 2 }} gutterBottom>
                    Para garantir que a sua conversa é privada, compare este número de segurança com o seu contacto. Se os números forem iguais, a sua conexão é segura.
                </Typography>
                {loading ? (
                    <CircularProgress sx={{ mt: 3 }} />
                ) : (
                    <Typography
                        sx={{ mt: 3, letterSpacing: 2, fontFamily: 'monospace', fontSize: '1.2rem' }}
                    >
                        {safetyNumber}
                    </Typography>
                )}
            </Box>
        </Modal>
    );
};