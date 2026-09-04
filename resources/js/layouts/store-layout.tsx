import { Link, router, usePage } from '@inertiajs/react';
import { Search, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { StoreBottomNav } from '@/components/store-bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import { catalog, home, login, register } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import { index as ordersIndex } from '@/routes/orders';
import { index as profileIndex } from '@/routes/profile';

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { auth, cartCount } = usePage().props;
    const user = auth.user;
    const count = Number(cartCount) || 0;
    const [search, setSearch] = useState('');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const term = search.trim();

        router.get(
            catalog.url({ query: term ? { search: term } : {} }),
            undefined,
            { preserveScroll: true },
        );
    };

    return (
        <div className="flex min-h-screen flex-col bg-background pb-16 md:pb-0">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
                    <Link href={home()} prefetch>
                        <span className="flex shrink-0 items-center">
                            <AppLogo />
                        </span>
                    </Link>

                    <nav className="flex items-center gap-2">
                        <form
                            onSubmit={handleSearch}
                            className="relative hidden sm:block"
                            role="search"
                        >
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-48 pl-9 md:w-64"
                                placeholder={t('Search products...')}
                                aria-label={t('Search products...')}
                            />
                        </form>
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="relative hidden sm:inline-flex"
                        >
                            <Link href={cartIndex()}>
                                <ShoppingCart className="size-5" />
                                {count > 0 && (
                                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
                                        {count > 99 ? '99+' : count}
                                    </span>
                                )}
                                <span className="sr-only">{t('Cart')}</span>
                            </Link>
                        </Button>
                        {user ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="hidden sm:inline-flex"
                                >
                                    <Link href={ordersIndex()}>
                                        {t('My orders')}
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link
                                        href={profileIndex()}
                                        className="hidden text-muted-foreground sm:inline-flex"
                                    >
                                        {user.name}
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={login()}>{t('Log in')}</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href={register()}>
                                        {t('Create account')}
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <StoreBottomNav />
        </div>
    );
}
