import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '../store/notification';

export const GlobalNotification = () => {
    const { open, message, severity, hideNotification } = useNotificationStore();

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        hideNotification();
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
};