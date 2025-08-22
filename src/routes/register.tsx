import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import api from '../api';
import { Box, Button, TextField, Typography, Container, Link as MuiLink } from '@mui/material';
import { useNotificationStore } from '../store/notification';
import { useLoadingStore } from '../store/loading'; // Importar a loja do loader

export const Route = createFileRoute('/register')({
    component: RegisterComponent,
});

function RegisterComponent() {
    const navigate = useNavigate();
    const showNotification = useNotificationStore((state) => state.showNotification);
    const { showLoader, hideLoader } = useLoadingStore(); // Obter as funções do loader

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        showLoader('A processar registo, aguarde...'); // Ativar o loader global
        const formData = new FormData(event.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        try {
            await api.post('/auth/register', { username, password });
            showNotification('Registo bem-sucedido! Faça o login.', 'success');
            navigate({ to: '/login' });
        } catch (error: any) {
            showNotification(error.response?.data?.message || 'Erro desconhecido', 'error');
        } finally {
            hideLoader(); // Desativar o loader global no final
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    [ CRIAR NOVA CONTA ]
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField margin="normal" required fullWidth id="username" label="Username" name="username" autoFocus />
                    <TextField margin="normal" required fullWidth name="password" label="Password (min. 8 caracteres, com complexidade)" type="password" id="password" />
                    <Button type="submit" fullWidth variant="outlined" sx={{ mt: 3, mb: 2 }}>
                        [ Registrar ]
                    </Button>
                    <MuiLink component={Link} to="/login" variant="body2">
                        Já tem uma conta? [ Login ]
                    </MuiLink>
                </Box>
            </Box>
        </Container>
    );
}