import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';
import { resolveBranding } from '@/lib/branding';

export default function AppLogo() {
    const { name, logo } = usePage().props;
    const branding = resolveBranding(name, logo);

    return (
        <>
            {branding.hasLogo && logo ? (
                <img
                    src={logo}
                    alt={branding.text}
                    className={branding.hasName ? 'h-10 w-auto' : 'h-16 w-auto'}
                />
            ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-950/40">
                    <AppLogoIcon className="size-5 fill-current text-white" />
                </div>
            )}
            {branding.showText && (
                <div className="ml-1 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold">
                        {branding.text}
                    </span>
                </div>
            )}
        </>
    );
}
