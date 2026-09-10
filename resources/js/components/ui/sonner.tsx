import { useSyncExternalStore } from 'react';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useAppearance } from '@/hooks/use-appearance';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const MOBILE_QUERY = '(max-width: 640px)';

const subscribeToViewport = (listener: () => void) => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
};

const getViewportSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

const getViewportServerSnapshot = () => false;

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();
    const isMobile = useSyncExternalStore(
        subscribeToViewport,
        getViewportSnapshot,
        getViewportServerSnapshot,
    );

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position={isMobile ? 'top-center' : 'bottom-right'}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
}

export { Toaster };
