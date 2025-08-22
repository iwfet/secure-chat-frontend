import { createRootRoute, Outlet } from '@tanstack/react-router';
import { GlobalNotification } from '../components/GlobalNotification';
import {GlobalLoader} from "../components/GlobalLoader.tsx";

export const Route = createRootRoute({
    component: () => (
        <>
            <Outlet />
            <GlobalNotification />
            <GlobalLoader />
        </>
    ),
});