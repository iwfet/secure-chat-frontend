import React from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import { Shield, VerifiedUser } from '@mui/icons-material';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    border: '2px solid #fff',
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
};

interface SecurityInfoModalProps {
    open: boolean;
    onClose: () => void;
}

export const SecurityInfoModal = ({
                                      open,
                                      onClose,
                                  }: SecurityInfoModalProps) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    bgcolor: 'background.paper',
                    border: '1px solid #555',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: 'center',
                }}
            >
                <VerifiedUser color="success" />[ CONEXÃO SEGURA ESTABELECIDA ]
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ textAlign: 'justify', color: 'text.secondary' }}>
                    A sua comunicação utiliza encriptação de ponta-a-ponta (E2EE). Isto
                    significa que apenas você e o seu contacto podem ler as mensagens.
                </DialogContentText>
                <DialogContentText
                    sx={{ textAlign: 'justify', color: 'text.primary', mt: 2 }}
                >
                    <strong>Para garantir 100% de segurança</strong> e proteger-se contra
                    ataques de interceção, verifique o seu{' '}
                    <strong>Número de Segurança</strong> clicando no ícone de escudo (
                    <Shield fontSize="inherit" />) no topo da janela de chat.
                </DialogContentText>
                <DialogContentText
                    sx={{ textAlign: 'justify', color: 'text.secondary', mt: 2 }}
                >
                    Compare este número com o seu contacto através de um canal externo
                    (pessoalmente, por telefone) ou pelo proprio chat no inicio da conversa(nao recomendado). Se os números forem iguais, a sua
                    conversa é totalmente privada e autenticada.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Entendi
                </Button>
            </DialogActions>
        </Dialog>
    );
};