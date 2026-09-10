import { Link, usePage } from '@inertiajs/react';
import {
    CreditCard,
    Image as ImageIcon,
    LayoutGrid,
    Layers,
    Package,
    Percent,
    ReceiptText,
    ShoppingCart,
    Tags,
    TrendingUp,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes/admin';
import { index as bannersIndex } from '@/routes/admin/banners';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as customersIndex } from '@/routes/admin/customers';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as paymentMethodsIndex } from '@/routes/admin/payment-methods';
import { index as productsIndex } from '@/routes/admin/products';
import { index as promoCodesIndex } from '@/routes/admin/promo-codes';
import {
    customerBuying,
    customerOrders,
    sellingProducts,
    totalSales,
} from '@/routes/admin/reports';
import type { NavItem } from '@/types';

const overviewNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const catalogNavItems: NavItem[] = [
    {
        title: 'Products',
        href: productsIndex(),
        icon: Layers,
    },
    {
        title: 'Categories',
        href: categoriesIndex(),
        icon: Tags,
    },
    {
        title: 'Banners',
        href: bannersIndex(),
        icon: ImageIcon,
    },
];

const salesNavItems: NavItem[] = [
    {
        title: 'Orders',
        href: ordersIndex(),
        icon: ShoppingCart,
    },
    {
        title: 'Customers',
        href: customersIndex(),
        icon: Users,
    },
    {
        title: 'Promo codes',
        href: promoCodesIndex(),
        icon: Percent,
    },
    {
        title: 'Payment methods',
        href: paymentMethodsIndex(),
        icon: CreditCard,
    },
];

const reportsNavItems: NavItem[] = [
    {
        title: 'Selling products',
        href: sellingProducts(),
        icon: Package,
    },
    {
        title: 'Customer buying',
        href: customerBuying(),
        icon: Users,
    },
    {
        title: 'Customer orders',
        href: customerOrders(),
        icon: ReceiptText,
    },
    {
        title: 'Total sales',
        href: totalSales(),
        icon: TrendingUp,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="relative overflow-hidden rounded-lg">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-600/40 via-indigo-500/20 to-transparent"
                    />
                    <SidebarMenu className="relative">
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={dashboard()} prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavMain label="Overview" items={overviewNavItems} />
                {isAdmin && (
                    <>
                        <NavMain label="Catalog" items={catalogNavItems} />
                        <NavMain label="Sales" items={salesNavItems} />
                        <NavMain label="Reports" items={reportsNavItems} />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
