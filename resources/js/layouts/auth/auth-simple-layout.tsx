import { Link, usePage } from '@inertiajs/react';
import { ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { resolveBranding } from '@/lib/branding';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name, logo } = usePage().props;
    const branding = resolveBranding(name, logo);

    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-2">
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-[oklch(0.28_0.11_285)] via-[oklch(0.35_0.18_280)] to-[oklch(0.55_0.21_290)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 select-none"
                >
                    <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
                    <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-indigo-400/25 blur-3xl" />
                    <div className="absolute top-40 -right-12 h-48 w-36 -rotate-12 rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-sm" />
                    <div className="absolute top-64 right-16 h-40 w-28 rotate-12 rounded-2xl border border-white/15 bg-white/5 shadow-xl backdrop-blur-sm" />
                    <div className="absolute right-28 -bottom-10 h-52 w-40 rotate-45 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-300/30 to-fuchsia-400/20 backdrop-blur-sm" />
                </div>

                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-3"
                >
                    {branding.hasLogo && logo ? (
                        <img
                            src={logo}
                            alt={branding.text}
                            className={
                                branding.hasName ? 'h-11 w-auto' : 'h-14 w-auto'
                            }
                        />
                    ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 shadow-lg ring-1 ring-white/25 backdrop-blur">
                            <AppLogoIcon className="size-7 fill-current text-white" />
                        </div>
                    )}
                    {branding.showText && (
                        <span className="text-lg font-semibold tracking-tight">
                            {branding.text}
                        </span>
                    )}
                </Link>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl leading-tight font-semibold tracking-tight">
                        Run your trading card empire.
                    </h1>
                    <p className="mt-4 text-balance text-white/70">
                        Manage your inventory, orders, and customers from one
                        powerful dashboard designed for serious collectors and
                        shops.
                    </p>

                    <div className="mt-10 space-y-4 text-sm text-white/80">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                                <Sparkles className="size-4" />
                            </div>
                            <span>
                                Track every card, booster box, and bundle
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                                <Wallet className="size-4" />
                            </div>
                            <span>
                                Stay on top of sales and revenue in real time
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                                <ShieldCheck className="size-4" />
                            </div>
                            <span>Secure checkout for every collector</span>
                        </div>
                    </div>
                </div>

                <p className="relative z-10 text-sm text-white/50">
                    Ac {new Date().getFullYear()} {branding.text} Admin
                </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 font-medium lg:hidden"
                            >
                                {branding.hasLogo && logo ? (
                                    <img
                                        src={logo}
                                        alt={branding.text}
                                        className="mb-1 h-11 w-auto"
                                    />
                                ) : (
                                    <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                                        <AppLogoIcon className="size-6 fill-current" />
                                    </div>
                                )}
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {title}
                                </h1>
                                <p className="text-sm text-balance text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
