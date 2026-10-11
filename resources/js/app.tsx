import type { PageProps, SharedPageProps } from '@inertiajs/core';
import { createInertiaApp, router } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import AuthLayout from '@/layouts/auth-layout';
import StoreLayout from '@/layouts/store-layout';
import { setCurrency } from '@/lib/currency';
import { setTimezone } from '@/lib/datetime';
import { setI18n } from '@/lib/i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

/**
 * Keep the module-level locale/currency/time-zone singletons in sync with
 * the latest page props. `withApp` only runs on the initial page load, so
 * without this a freshly saved preference would not apply until a hard
 * refresh. `beforeUpdate` carries the incoming page before it renders;
 * `navigate` additionally covers history traversals.
 */
function syncAppState(props: PageProps & SharedPageProps): void {
    setI18n(props.locale, props.translations);
    setCurrency(props.currency);
    setTimezone(props.auth?.user?.timezone ?? null);
}

router.on('beforeUpdate', (event) => {
    syncAppState(event.detail.page.props);
});

router.on('navigate', (event) => {
    syncAppState(event.detail.page.props);
});

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
        syncAppState(page.props);

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
