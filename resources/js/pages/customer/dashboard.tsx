import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import { catalog } from '@/routes';
import { index as ordersIndex, show as showOrder } from '@/routes/orders';
import type { OrderStatus } from '@/types';

type CustomerOrder = {
    id: number;
    order_number: string;
    items_count: number;
    total: string;
    status: OrderStatus;
    created_at: string;
};

type Props = {
    orderCount: number;
    recentOrders: CustomerOrder[];
    statuses: Record<string, string>;
};

const statusStyles: Record<OrderStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    confirmed: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    processing: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    shipped: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

export default function CustomerDashboard({
    orderCount,
    recentOrders,
    statuses,
}: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title={t('Dashboard')} />

            <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 md:px-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-lg shadow-indigo-950/10">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-white/10 blur-3xl"
                    />
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-white/70">
                            {t('Welcome back')}
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                            {auth.user?.name ?? t('Collector')}
                        </h1>
                        <p className="mt-2 max-w-md text-sm text-white/70">
                            {orderCount > 0
                                ? orderCount === 1
                                    ? t(
                                          'You have placed {count} order with us.',
                                          {
                                              count: orderCount,
                                          },
                                      )
                                    : t(
                                          'You have placed {count} orders with us.',
                                          { count: orderCount },
                                      )
                                : t(
                                      'Start collecting your favorite cards today.',
                                  )}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href={catalog()}>
                            <ShoppingBag className="size-4" />
                            {t('Browse the catalog')}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={ordersIndex()}>
                            {t('My orders')}
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>

                <h2 className="mt-10 text-xl font-semibold tracking-tight">
                    {t('Recent orders')}
                </h2>

                {recentOrders.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-4">
                        {recentOrders.map((order) => (
                            <Card key={order.id}>
                                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">
                                                {order.order_number}
                                            </p>
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[order.status]}`}
                                            >
                                                {t(
                                                    statuses[order.status] ??
                                                        order.status,
                                                )}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {order.items_count === 1
                                                ? t(
                                                      'Placed {date} · {count} item',
                                                      {
                                                          date: new Date(
                                                              order.created_at,
                                                          ).toLocaleDateString(),
                                                          count: order.items_count,
                                                      },
                                                  )
                                                : t(
                                                      'Placed {date} · {count} items',
                                                      {
                                                          date: new Date(
                                                              order.created_at,
                                                          ).toLocaleDateString(),
                                                          count: order.items_count,
                                                      },
                                                  )}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <p className="text-lg font-semibold">
                                            {formatCurrency(order.total)}
                                        </p>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={showOrder({
                                                    order: order.id,
                                                })}
                                            >
                                                {t('View')}
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border py-14 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                            <Package className="size-7" />
                        </div>
                        <h3 className="text-lg font-semibold">
                            {t('No orders yet')}
                        </h3>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {t(
                                'When you place an order, it will show up here.',
                            )}
                        </p>
                        <Button asChild variant="outline" className="mt-2">
                            <Link href={catalog()}>{t('Start shopping')}</Link>
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
