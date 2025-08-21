import { createTheme } from '@mui/material/styles';

export const hackerTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#ffffff',
        },
        background: {
            default: '#000000',
            paper: '#1a1a1a',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
        },
    },
    typography: {
        fontFamily: '"Fira Code", "Courier New", monospace',
        allVariants: {
            color: '#ffffff',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderColor: '#ffffff',
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: '#333333',
                        borderColor: '#ffffff',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#555555',
                        },
                        '&:hover fieldset': {
                            borderColor: '#ffffff',
                        },
                    },
                },
            },
        },
    },
});