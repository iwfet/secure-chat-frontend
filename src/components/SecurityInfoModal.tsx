import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
} from '@mui/material';
import { VerifiedUser, Shield, Loop } from '@mui/icons-material';

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
                    maxWidth: '450px',
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
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        A sua comunicação utiliza encriptação de ponta-a-ponta (E2EE), o que
                        significa que apenas você e o seu contacto podem ler as mensagens.
                    </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Shield />
                        Verificação de Segurança
                    </Typography>
                    <DialogContentText sx={{ color: 'text.secondary', mt: 1 }}>
                        Para garantir <strong>100% de privacidade</strong> e proteger-se contra
                        ataques, verifique o seu <strong>Número de Segurança</strong>.
                        Clique no ícone de escudo (<Shield fontSize="inherit" />) no topo da
                        conversa para o ver.
                    </DialogContentText>
                    <DialogContentText sx={{ color: 'text.secondary', mt: 1 }}>
                        {/* Texto Alterado Abaixo */}
                        A forma mais segura de comparar é através de um{' '}
                        <strong>canal externo e confiável</strong> (pessoalmente ou por
                        videochamada). Enviar o número pelo próprio chat é uma opção, mas{' '}
                        <strong>não é recomendado do ponto de vista da segurança</strong>, pois não protege contra um ataque de interceção ativo.
                    </DialogContentText>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Loop />
                        Segurança Contínua
                    </Typography>
                    <DialogContentText sx={{ color: 'text.secondary', mt: 1 }}>
                        Para manter a máxima segurança, é uma boa prática re-verificar o Número de Segurança de tempos em tempos, especialmente se um dos utilizadores reinstalar a aplicação ou mudar de dispositivo.
                    </DialogContentText>
                </Box>

            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose} variant="outlined" fullWidth>
                    Entendido
                </Button>
            </DialogActions>
        </Dialog>
    );
};