import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import api from '../api';
import { Box, Button, TextField, Typography, Container, Link as MuiLink } from '@mui/material';

export const Route = createFileRoute('/register')({
    component: RegisterComponent,
});

function RegisterComponent() {
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        try {
            await api.post('/auth/register', { username, password });
            alert('Registro bem-sucedido! Faça o login.');
            navigate({ to: '/login' });
        } catch (error: any) {
            console.error('Falha no registro', error);
            alert(error.response?.data?.message || 'Erro desconhecido');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    [ CRIAR NOVA CONTA ]
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password (min. 8 caracteres, com complexidade)"
                        type="password"
                        id="password"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 3, mb: 2 }}
                    >
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