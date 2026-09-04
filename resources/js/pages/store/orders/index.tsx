import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import { catalog } from '@/routes';
import { index as ordersIndex, show as showOrder } from '@/routes/orders';
import type {
    DownPaymentStatus,
    OrderStatus,
    PaginatedData,
    PaymentMethod,
    PaymentStatus,
} from '@/types';

type OrderListItem = {
    id: number;
    order_number: string;
    status: OrderStatus;
    payment_method: PaymentMethod | null;
    payment_status: PaymentStatus;
    down_payment: string;
    down_payment_status: DownPaymentStatus;
    total: string;
    created_at: string;
    items_count: number;
};

type Props = {
    orders: PaginatedData<OrderListItem>;
    statuses: Record<string, string>;
    paymentMethods: Record<string, string>;
    paymentStatuses: Record<string, string>;
    downPaymentStatuses: Record<string, string>;
};

const statusStyles: Record<OrderStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    confirmed: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    processing: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    shipped: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const paymentStyles: Record<PaymentStatus, string> = {
    unpaid: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    refunded: 'bg-muted text-muted-foreground ring-border',
};

const downPaymentStyles: Record<DownPaymentStatus, string> = {
    unpaid: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export default function MyOrders({
    orders,
    statuses,
    paymentMethods,
    paymentStatuses,
    downPaymentStatuses,
}: Props) {
    return (
        <>
            <Head title={t('My Orders')} />

            <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 md:px-6">
                <h1 className="text-3xl font-semibold tracking-tight">
                    {t('My orders')}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t('Track and review the orders you have placed')}
                </p>

                {orders.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-24 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                            <Package className="size-7" />
                        </div>
                        <h2 className="text-lg font-semibold">
                            {t('No orders yet')}
                        </h2>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {t(
                                'When you place an order, it will show up here.',
                            )}
                        </p>
                        <Button asChild className="mt-2">
                            <Link href={catalog()}>
                                {t('Browse the catalog')}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-6 flex flex-col gap-4">
                        {orders.data.map((order) => (
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
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${paymentStyles[order.payment_status]}`}
                                            >
                                                {t(
                                                    paymentStatuses[
                                                        order.payment_status
                                                    ] ?? order.payment_status,
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
                                            {order.payment_method
                                                ? ` · ${t(
                                                      paymentMethods[
                                                          order.payment_method
                                                      ] ?? order.payment_method,
                                                  )}`
                                                : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <div className="text-right">
                                            <p className="text-lg font-semibold">
                                                {formatCurrency(order.total)}
                                            </p>
                                            {Number(order.down_payment) > 0 && (
                                                <p className="mt-1 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                                                    {t('Down payment')}:{' '}
                                                    {formatCurrency(
                                                        order.down_payment,
                                                    )}
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${downPaymentStyles[order.down_payment_status]}`}
                                                    >
                                                        {t(
                                                            downPaymentStatuses[
                                                                order
                                                                    .down_payment_status
                                                            ] ??
                                                                order
                                                                    .down_payment_status,
                                                        )}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
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
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {orders.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-1">
                                {Array.from(
                                    { length: orders.last_page },
                                    (_, i) => i + 1,
                                ).map((page) => {
                                    const isActive =
                                        page === orders.current_page;

                                    return (
                                        <Button
                                            key={page}
                                            asChild
                                            variant={
                                                isActive ? 'default' : 'ghost'
                                            }
                                            size="sm"
                                            className="size-8 px-0"
                                        >
                                            <Link
                                                href={ordersIndex.url({
                                                    query: { page },
                                                })}
                                                preserveScroll
                                            >
                                                {page}
                                            </Link>
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
