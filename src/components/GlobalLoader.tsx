import React from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';
import { useLoadingStore } from '../store/loading';

export const GlobalLoader = () => {
    const { isLoading, message } = useLoadingStore();

    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: 'rgba(0, 0, 0, 0.8)'
            }}
            open={isLoading}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h6">{message}</Typography>
            </Box>
        </Backdrop>
    );
};