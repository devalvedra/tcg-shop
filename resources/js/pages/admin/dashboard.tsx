import { Form, Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    ArrowRight,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import { dashboard } from '@/routes/admin';
import { index as ordersIndex } from '@/routes/admin/orders';
import {
    edit as editProduct,
    index as productsIndex,
} from '@/routes/admin/products';
import type { OrderStatus } from '@/types';

const nativeSelectClasses =
    'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

type Stat = {
    label: string;
    value: string;
    sub: string;
    subTone?: string;
    icon: LucideIcon;
    tint: string;
};

type RecentOrder = {
    id: number;
    order_number: string;
    customer_name: string | null;
    items_count: number;
    total: string;
    status: OrderStatus;
    created_at: string;
};

type TopSeller = {
    product_name: string;
    total_sold: number;
    total_revenue: number;
};

type LowStockItem = {
    id: number;
    name: string;
    category: string;
    stock: number;
    image: string | null;
};

type SalesDay = {
    day: number;
    revenue: number;
    orders: number;
};

type Props = {
    stats: {
        total_revenue: number;
        orders_count: number;
        pending_orders: number;
        customers_count: number;
        units_in_stock: number;
        low_stock_count: number;
    };
    recentOrders: RecentOrder[];
    topSellers: TopSeller[];
    lowStock: LowStockItem[];
    salesByDay: SalesDay[];
    statuses: Record<string, string>;
    filters: {
        month: number;
        year: number;
    };
    months: string[];
    years: number[];
};

const statusStyles: Record<OrderStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    confirmed: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    processing: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    shipped: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

let isHydrated = false;

const hydrationSubscribers = new Set<() => void>();

const subscribeHydration = (listener: () => void) => {
    hydrationSubscribers.add(listener);

    return () => {
        hydrationSubscribers.delete(listener);
    };
};

const getHydrationSnapshot = () => isHydrated;

const getHydrationServerSnapshot = () => false;

export default function Dashboard({
    stats,
    recentOrders,
    topSellers,
    lowStock,
    salesByDay,
    statuses,
    filters,
    months,
    years,
}: Props) {
    const { auth, locale } = usePage().props;

    const mounted = useSyncExternalStore(
        subscribeHydration,
        getHydrationSnapshot,
        getHydrationServerSnapshot,
    );

    useEffect(() => {
        isHydrated = true;
        hydrationSubscribers.forEach((listener) => listener());
    }, []);

    const monthLabel = months[filters.month - 1] ?? `${filters.month}`;
    const maxRevenue = Math.max(...salesByDay.map((day) => day.revenue), 1);
    const chartTotal = salesByDay.reduce((sum, day) => sum + day.revenue, 0);
    const chartOrders = salesByDay.reduce((sum, day) => sum + day.orders, 0);

    const dayDate = (day: number) =>
        new Date(filters.year, filters.month - 1, day).toLocaleDateString(
            locale === 'id' ? 'id-ID' : 'en-US',
            { month: 'short', day: 'numeric' },
        );

    const daySummary = (day: SalesDay) =>
        `${dayDate(day.day)} · ${
            day.orders === 1
                ? t('{count} order', { count: day.orders })
                : t('{count} orders', { count: day.orders })
        }${day.revenue > 0 ? ` · ${formatCurrency(day.revenue)}` : ''}`;

    const statCards: Stat[] = [
        {
            label: 'Total revenue',
            value: formatCurrency(stats.total_revenue),
            sub: t('Across all orders'),
            icon: Wallet,
            tint: 'from-indigo-500 to-violet-600',
        },
        {
            label: 'Orders',
            value: stats.orders_count.toLocaleString(),
            sub: t('{count} pending', {
                count: stats.pending_orders,
            }),
            subTone:
                stats.pending_orders > 0
                    ? 'text-amber-600'
                    : 'text-emerald-600',
            icon: ShoppingCart,
            tint: 'from-fuchsia-500 to-pink-600',
        },
        {
            label: 'Units in stock',
            value: stats.units_in_stock.toLocaleString(),
            sub:
                stats.low_stock_count > 0
                    ? t('{count} low stock', {
                          count: stats.low_stock_count,
                      })
                    : t('Well stocked'),
            subTone:
                stats.low_stock_count > 0
                    ? 'text-rose-600'
                    : 'text-emerald-600',
            icon: Package,
            tint: 'from-amber-500 to-orange-600',
        },
        {
            label: 'Customers',
            value: stats.customers_count.toLocaleString(),
            sub: t('Registered customers'),
            icon: Users,
            tint: 'from-emerald-500 to-teal-600',
        },
    ];

    return (
        <>
            <Head title={t('Dashboard')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[oklch(0.28_0.11_285)] via-[oklch(0.38_0.18_280)] to-[oklch(0.55_0.21_290)] p-8 text-white shadow-lg shadow-indigo-950/10">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-fuchsia-500/30 blur-3xl"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute right-40 -bottom-24 size-64 rounded-full bg-indigo-400/30 blur-3xl"
                    />
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-white/70">
                            {t('Welcome back')}
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                            {auth.user?.name ?? t('Admin')}
                        </h1>
                        <p className="mt-2 max-w-md text-sm text-white/70">
                            {t("Here's what's happening in your shop today.")}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground">
                            {t('Reporting period')}
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {t(
                                'Revenue, orders, and sales data below reflect the selected month.',
                            )}
                        </p>
                    </div>
                    <Form
                        {...dashboard.form()}
                        className="flex items-center gap-2"
                    >
                        <select
                            name="month"
                            defaultValue={filters.month}
                            aria-label={t('Month')}
                            className={nativeSelectClasses}
                        >
                            {months.map((label, index) => (
                                <option key={label} value={index + 1}>
                                    {t(label)}
                                </option>
                            ))}
                        </select>
                        <select
                            name="year"
                            defaultValue={filters.year}
                            aria-label={t('Year')}
                            className={nativeSelectClasses}
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <Button type="submit" variant="outline">
                            {t('Apply')}
                        </Button>
                    </Form>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map(
                        ({ label, value, sub, subTone, icon: Icon, tint }) => (
                            <Card
                                key={label}
                                className="gap-0 overflow-hidden py-5"
                            >
                                <CardContent className="flex items-start justify-between px-5">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {t(label)}
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold tracking-tight">
                                            {value}
                                        </p>
                                        <p
                                            className={`mt-2 text-xs font-medium ${
                                                subTone ??
                                                'text-muted-foreground'
                                            }`}
                                        >
                                            {sub}
                                        </p>
                                    </div>
                                    <div
                                        className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md`}
                                    >
                                        <Icon className="size-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        ),
                    )}
                </div>

                <Card className="gap-0 py-5">
                    <CardHeader className="flex-row items-center justify-between px-5 py-0">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="size-4 text-indigo-600" />
                                {t('Sales this month')}
                            </CardTitle>
                            <CardDescription>
                                {t('Daily revenue · {month} {year}', {
                                    month: t(monthLabel),
                                    year: filters.year,
                                })}
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-semibold tracking-tight">
                                {formatCurrency(chartTotal)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {chartOrders === 1
                                    ? t('{count} order', {
                                          count: chartOrders,
                                      })
                                    : t('{count} orders', {
                                          count: chartOrders,
                                      })}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pt-6">
                        <div className="flex h-48 items-end gap-[3px]">
                            {salesByDay.map((day) => {
                                const bar = (
                                    <div
                                        key={day.day}
                                        title={
                                            mounted ? undefined : daySummary(day)
                                        }
                                        className={`flex-1 cursor-pointer rounded-t transition-colors ${
                                            day.revenue > 0
                                                ? 'bg-indigo-500 hover:bg-indigo-600'
                                                : 'bg-muted'
                                        }`}
                                        style={{
                                            height:
                                                day.revenue > 0
                                                    ? `${(day.revenue / maxRevenue) * 100}%`
                                                    : '2px',
                                        }}
                                    />
                                );

                                if (!mounted) {
                                    return bar;
                                }

                                return (
                                    <Tooltip key={day.day}>
                                        <TooltipTrigger asChild>
                                            {bar}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <span className="font-semibold">
                                                {dayDate(day.day)}
                                            </span>
                                            {' · '}
                                            <span>
                                                {day.orders === 1
                                                    ? t('{count} order', {
                                                          count: day.orders,
                                                      })
                                                    : t('{count} orders', {
                                                          count: day.orders,
                                                      })}
                                            </span>
                                            {day.revenue > 0 && (
                                                <>
                                                    {' · '}
                                                    <span>
                                                        {formatCurrency(
                                                            day.revenue,
                                                        )}
                                                    </span>
                                                </>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                        <div className="mt-2 flex gap-[3px]">
                            {salesByDay.map((day) => (
                                <div
                                    key={day.day}
                                    className="flex-1 text-center text-[10px] text-muted-foreground"
                                >
                                    {day.day % 5 === 0 ? day.day : ''}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card className="gap-0 py-5 xl:col-span-2">
                        <CardHeader className="flex-row items-center justify-between px-5 py-0">
                            <div>
                                <CardTitle>{t('Recent orders')}</CardTitle>
                                <CardDescription>
                                    {t('Latest purchases from your storefront')}
                                </CardDescription>
                            </div>
                            <Link
                                href={ordersIndex()}
                                className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
                            >
                                {t('View all')}
                                <ArrowRight className="size-4" />
                            </Link>
                        </CardHeader>
                        <CardContent className="px-5 pt-6">
                            {recentOrders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-xs text-muted-foreground">
                                                <th className="pb-3 font-medium">
                                                    {t('Order')}
                                                </th>
                                                <th className="pb-3 font-medium">
                                                    {t('Customer')}
                                                </th>
                                                <th className="hidden pb-3 font-medium md:table-cell">
                                                    {t('Items')}
                                                </th>
                                                <th className="pb-3 text-right font-medium">
                                                    {t('Total')}
                                                </th>
                                                <th className="pb-3 text-right font-medium">
                                                    {t('Status')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {recentOrders.map((order) => (
                                                <tr key={order.id}>
                                                    <td className="py-3 font-medium">
                                                        {order.order_number}
                                                    </td>
                                                    <td className="py-3">
                                                        {order.customer_name ??
                                                            '—'}
                                                    </td>
                                                    <td className="hidden py-3 text-muted-foreground md:table-cell">
                                                        {order.items_count}
                                                    </td>
                                                    <td className="py-3 text-right font-medium">
                                                        {formatCurrency(
                                                            order.total,
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[order.status]}`}
                                                        >
                                                            {t(
                                                                statuses[
                                                                    order.status
                                                                ] ??
                                                                    order.status,
                                                            )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    {t('No orders yet.')}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card className="gap-0 py-5">
                            <CardHeader className="px-5 py-0">
                                <CardTitle>{t('Top sellers')}</CardTitle>
                                <CardDescription>
                                    {t('Best performing products overall')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 px-5 pt-6">
                                {topSellers.length > 0 ? (
                                    topSellers.map((seller, index) => (
                                        <div
                                            key={seller.product_name}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {seller.product_name}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {t(
                                                        '{count} sold · {revenue}',
                                                        {
                                                            count: seller.total_sold,
                                                            revenue:
                                                                formatCurrency(
                                                                    seller.total_revenue,
                                                                ),
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        {t('No sales data yet.')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="gap-0 py-5">
                            <CardHeader className="flex-row items-center justify-between px-5 py-0">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="size-4 text-amber-600" />
                                        {t('Low stock')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('Ready products running low')}
                                    </CardDescription>
                                </div>
                                <Link
                                    href={productsIndex()}
                                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
                                >
                                    {t('Manage')}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-3 px-5 pt-6">
                                {lowStock.length > 0 ? (
                                    lowStock.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={editProduct({
                                                product: item.id,
                                            })}
                                            className="flex items-center gap-3 rounded-lg transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="size-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.category}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                    item.stock === 0
                                                        ? 'bg-rose-50 text-rose-700 ring-rose-600/20'
                                                        : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                                }`}
                                            >
                                                {t('{count} left', {
                                                    count: item.stock,
                                                })}
                                            </span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        {t('No low stock items.')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: t('Dashboard'),
            href: dashboard(),
        },
    ],
};
