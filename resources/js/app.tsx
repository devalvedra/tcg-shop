import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import AuthLayout from '@/layouts/auth-layout';
import StoreLayout from '@/layouts/store-layout';
import { setCurrency } from '@/lib/currency';
import { setI18n } from '@/lib/i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'auth/login':
            case name === 'auth/register':
            case name === 'auth/pending-verification':
                return AuthCardLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('store/'):
            case name.startsWith('customer/'):
                return StoreLayout;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app, { page }) {
        setI18n(page.props.locale, page.props.translations);
        setCurrency(page.props.currency);

        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#6366F1',
    },
});

// This will set light / dark mode on load...
initializeTheme();
