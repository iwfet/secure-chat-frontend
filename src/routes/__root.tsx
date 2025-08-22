import { createRootRoute, Outlet } from '@tanstack/react-router';
import { GlobalNotification } from '../components/GlobalNotification';

export const Route = createRootRoute({
    component: () => (
        <>
            <Outlet />
            <GlobalNotification />
        </>
    ),
});