import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { hackerTheme } from './theme/theme';

// Importa a definição das nossas rotas
import { routeTree } from './routeTree.gen';

// Cria a instância do router
const router = createRouter({ routeTree });

// Declara os módulos para o router
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={hackerTheme}>
            <CssBaseline />
            <RouterProvider router={router} />
        </ThemeProvider>
    </React.StrictMode>
);