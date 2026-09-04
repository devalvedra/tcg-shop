import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    LayoutGrid,
    ReceiptText,
    ShoppingCart,
    UserRound,
} from 'lucide-react';
import { t } from '@/lib/i18n';
import { catalog, home } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import { index as ordersIndex } from '@/routes/orders';
import { index as profileIndex } from '@/routes/profile';

type NavItem = {
    label: string;
    href: string;
    path: string;
    icon: typeof Home;
    badge?: number;
};

const isActive = (url: string, path: string) => {
    if (path === '/') {
        return url === '/';
    }

    return url === path || url.startsWith(`${path}/`);
};

export function StoreBottomNav() {
    const { url } = usePage();
    const { cartCount } = usePage().props;
    const count = Number(cartCount) || 0;

    const items: NavItem[] = [
        { label: 'Home', href: home().url, path: '/', icon: Home },
        {
            label: 'Catalog',
            href: catalog().url,
            path: '/catalog',
            icon: LayoutGrid,
        },
        {
            label: 'Cart',
            href: cartIndex().url,
            path: '/cart',
            icon: ShoppingCart,
            badge: count,
        },
        {
            label: 'Orders',
            href: ordersIndex().url,
            path: '/orders',
            icon: ReceiptText,
        },
        {
            label: 'Profile',
            href: profileIndex().url,
            path: '/profile',
            icon: UserRound,
        },
    ];

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <div className="grid h-16 grid-cols-5">
                {items.map((item) => {
                    const active = isActive(url, item.path);

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            prefetch
                            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                                active
                                    ? 'text-indigo-600'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <span className="relative inline-flex">
                                <item.icon className="size-5" />
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] leading-none font-semibold text-white">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </span>
                            {t(item.label)}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
