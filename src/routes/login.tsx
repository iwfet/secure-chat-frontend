import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuthStore } from '../store/auth';
import { useSessionStore } from '../store/session'; // Importar a nova loja
import { generateKeyPair } from '../lib/crypto'; // Importar a função de cripto
import api from '../api';
import { Box, Button, TextField, Typography, Container, Link as MuiLink } from '@mui/material';

export const Route = createFileRoute('/login')({
    component: LoginComponent,
});

function LoginComponent() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const { setKeys, connectSocket } = useSessionStore(); // Obter funções da loja de sessão

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        try {
            // 1. Autenticação via API
            const response = await api.post('/auth/login', { username, password });
            const token = response.data.access_token;
            login(token);

            // 2. Geração das chaves efêmeras
            const keyPair = await generateKeyPair();
            setKeys(keyPair.publicKey, keyPair.privateKey);

            // 3. Conexão do Socket com a chave pública
            connectSocket(token, keyPair.publicKey);

            // 4. Navegação para o chat
            navigate({ to: '/' });
        } catch (error) {
            console.error('Falha no login', error);
            // Adicionar feedback de erro para o usuário aqui
        }
    };

    return (
        // ... O JSX do componente permanece o mesmo ...
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
                    [ LOGIN TERMINAL ]
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
                        label="Password"
                        type="password"
                        id="password"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        [ Authenticate ]
                    </Button>
                    <MuiLink component={Link} to="/register" variant="body2">
                        Não tem uma conta? [ Crie uma ]
                    </MuiLink>
                </Box>
            </Box>
        </Container>
    );
}