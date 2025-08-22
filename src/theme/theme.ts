import { createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const hackerTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00ff41', // Verde hacker
        },
        background: {
            default: '#000000',
            paper: '#0d0d0d',
        },
        text: {
            primary: '#00ff41',
            secondary: '#b3b3b3',
        },
        error: {
            main: '#ff415e',
        },
        success: {
            main: '#41ffca',
        },
    },
    typography: {
        fontFamily: '"Fira Code", "Courier New", monospace',
        allVariants: {
            color: '#00ff41',
            textShadow: '0 0 5px rgba(0,255,65,0.5)',
        },
        h5: {
            animation: 'glitch 1.5s linear infinite',
        },
        h6: {
            animation: 'glitch 2.5s linear infinite alternate-reverse',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
        @keyframes glitch {
          2%, 64% { transform: translate(2px, 0) skew(0deg); }
          4%, 60% { transform: translate(-2px, 0) skew(0deg); }
          62% { transform: translate(0, 0) skew(5deg); }
        }
        body {
          background-color: #000;
          overflow: hidden;
          position: relative;
        }
        body::after {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 2;
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
          animation: scanlines 2s linear infinite;
        }
        @keyframes scanlines {
          from { background-position: 0 0; }
          to { background-position: 0 100%; }
        }
      `,
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderColor: '#00ff41',
                    color: '#00ff41',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 255, 65, 0.1)',
                        borderColor: '#00ff41',
                        boxShadow: '0 0 10px #00ff41',
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
                            borderColor: '#00ff41',
                        },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                        color: '#00ff41',
                    },
                },
            },
        },
    },
});

export { hackerTheme };