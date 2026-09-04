import { Form, Head, Link, router } from '@inertiajs/react';
import { Check, Download, Eye, Search, ShoppingCart, X } from 'lucide-react';
import OrderController from '@/actions/App/Http/Controllers/Admin/OrderController';
import { SortableTh } from '@/components/sortable-th';
import type { SortDirection } from '@/components/sortable-th';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import {
    exportMethod,
    index as ordersIndex,
    show as showOrder,
    update as updateOrder,
} from '@/routes/admin/orders';
import type { Order, OrderStatus, PaginatedData } from '@/types';

type Filters = {
    search?: string;
    status?: string;
    from?: string;
    to?: string;
    sort?: string;
    direction?: SortDirection;
};

type Props = {
    orders: PaginatedData<Order>;
    filters: Filters;
    statuses: Record<string, string>;
};

const nativeSelectClasses =
    'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

const inlineSelectClasses =
    'h-8 rounded-md border border-input bg-background px-2 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

export default function OrdersIndex({ orders, filters, statuses }: Props) {
    const activeFilters = {
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
    };

    const hasFilters = Object.keys(activeFilters).length > 0;

    const direction: SortDirection =
        filters.direction === 'desc' ? 'desc' : 'asc';

    const sortQuery = {
        ...activeFilters,
        ...(filters.sort ? { sort: filters.sort } : {}),
        ...(filters.sort && filters.direction
            ? { direction: filters.direction }
            : {}),
    };

    const sortHref = (sortKey: string, sortDirection: SortDirection) =>
        ordersIndex.url({
            query: { ...activeFilters, sort: sortKey, direction: sortDirection },
        });

    const changeStatus = (order: Order, status: OrderStatus) => {
        router.put(
            updateOrder.url({ order: order.id }),
            { status },
            { preserveScroll: true },
        );
    };

    const togglePaid = (order: Order) => {
        const next =
            order.payment_status === 'paid' ? 'unpaid' : 'paid';

        const confirmed = window.confirm(
            next === 'paid'
                ? t('Mark order {number} as paid?', {
                      number: order.order_number,
                  })
                : t('Mark order {number} as unpaid?', {
                      number: order.order_number,
                  }),
        );

        if (!confirmed) {
            return;
        }

        router.put(
            updateOrder.url({ order: order.id }),
            { payment_status: next },
            { preserveScroll: true },
        );
    };

    const toggleDownPayment = (order: Order) => {
        const next =
            order.down_payment_status === 'paid' ? 'unpaid' : 'paid';

        const confirmed = window.confirm(
            next === 'paid'
                ? t('Mark down payment for order {number} as paid?', {
                      number: order.order_number,
                  })
                : t('Mark down payment for order {number} as unpaid?', {
                      number: order.order_number,
                  }),
        );

        if (!confirmed) {
            return;
        }

        router.put(
            updateOrder.url({ order: order.id }),
            { down_payment_status: next },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={t('Orders')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Orders')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'Track, fulfill, and review every order from your storefront',
                            )}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <a href={exportMethod.url({ query: activeFilters })}>
                            <Download className="size-4" />
                            {t('Export CSV')}
                        </a>
                    </Button>
                </div>

                <Card className="gap-0 overflow-hidden py-0">
                    <CardContent className="p-0">
                        <div className="border-b p-4">
                            <Form
                                {...OrderController.index.form()}
                                className="flex flex-col gap-2 lg:flex-row lg:items-center"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        defaultValue={filters.search}
                                        className="pl-9"
                                        placeholder={t(
                                            'Search order, customer, or product...',
                                        )}
                                    />
                                </div>
                                <Input
                                    name="from"
                                    type="date"
                                    defaultValue={filters.from}
                                    aria-label={t('From date')}
                                    className="lg:max-w-40"
                                />
                                <Input
                                    name="to"
                                    type="date"
                                    defaultValue={filters.to}
                                    aria-label={t('To date')}
                                    className="lg:max-w-40"
                                />
                                <select
                                    name="status"
                                    defaultValue={filters.status}
                                    className={nativeSelectClasses}
                                >
                                    <option value="">
                                        {t('All statuses')}
                                    </option>
                                    {Object.entries(statuses).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {t(label)}
                                            </option>
                                        ),
                                    )}
                                </select>
                                {filters.sort && (
                                    <input
                                        type="hidden"
                                        name="sort"
                                        value={filters.sort}
                                    />
                                )}
                                {filters.direction && (
                                    <input
                                        type="hidden"
                                        name="direction"
                                        value={filters.direction}
                                    />
                                )}
                                <Button type="submit" variant="outline">
                                    {t('Search')}
                                </Button>
                            </Form>
                        </div>

                        {orders.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <SortableTh
                                                label={t('Order')}
                                                sortKey="order"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                            />
                                            <SortableTh
                                                label={t('Date')}
                                                sortKey="date"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                            />
                                            <SortableTh
                                                label={t('Customer')}
                                                sortKey="customer"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden md:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Items')}
                                                sortKey="items"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden lg:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Total')}
                                                sortKey="total"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden lg:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Down payment')}
                                                sortKey="down_payment"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden xl:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Paid')}
                                                sortKey="paid"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden xl:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Status')}
                                                sortKey="status"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden md:table-cell"
                                            />
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {orders.data.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={showOrder({
                                                            order: order.id,
                                                        })}
                                                        className="font-medium text-foreground hover:underline"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {new Date(
                                                        order.created_at,
                                                    ).toLocaleString()}
                                                </td>
                                                <td className="hidden px-4 py-3 md:table-cell">
                                                    <p className="truncate font-medium">
                                                        {order.customer.name}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {order.customer.phone}
                                                    </p>
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                                                    {order.items.length}
                                                </td>
                                                <td className="hidden px-4 py-3 font-medium lg:table-cell">
                                                    {formatCurrency(
                                                        order.total,
                                                    )}
                                                </td>
                                                <td className="hidden px-4 py-3 xl:table-cell">
                                                    {Number(
                                                        order.down_payment,
                                                    ) > 0 ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-6 text-muted-foreground hover:bg-transparent"
                                                                title={
                                                                    order.down_payment_status ===
                                                                    'paid'
                                                                        ? t(
                                                                              'Mark down payment as unpaid',
                                                                          )
                                                                        : t(
                                                                              'Mark down payment as paid',
                                                                          )
                                                                }
                                                                onClick={() =>
                                                                    toggleDownPayment(
                                                                        order,
                                                                    )
                                                                }
                                                            >
                                                                {order.down_payment_status ===
                                                                'paid' ? (
                                                                    <Check
                                                                        className="size-4 text-emerald-600"
                                                                        aria-label={t(
                                                                            'Down payment paid',
                                                                        )}
                                                                    />
                                                                ) : (
                                                                    <X
                                                                        className="size-4 text-rose-600"
                                                                        aria-label={t(
                                                                            'Down payment unpaid',
                                                                        )}
                                                                    />
                                                                )}
                                                            </Button>
                                                            <span className="font-medium">
                                                                {formatCurrency(
                                                                    order.down_payment,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="hidden px-4 py-3 xl:table-cell">
                                                    {order.payment_status ===
                                                    'refunded' ? (
                                                        <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border ring-inset">
                                                            {t('Refunded')}
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-6 text-muted-foreground hover:bg-transparent"
                                                            title={
                                                                order.payment_status ===
                                                                'paid'
                                                                    ? t(
                                                                          'Mark order as unpaid',
                                                                      )
                                                                    : t(
                                                                          'Mark order as paid',
                                                                      )
                                                            }
                                                            onClick={() =>
                                                                togglePaid(order)
                                                            }
                                                        >
                                                            {order.payment_status ===
                                                            'paid' ? (
                                                                <Check
                                                                    className="size-4 text-emerald-600"
                                                                    aria-label={t(
                                                                        'Order paid',
                                                                    )}
                                                                />
                                                            ) : (
                                                                <X
                                                                    className="size-4 text-rose-600"
                                                                    aria-label={t(
                                                                        'Order unpaid',
                                                                    )}
                                                                />
                                                            )}
                                                        </Button>
                                                    )}
                                                </td>
                                                <td className="hidden px-4 py-3 md:table-cell">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) =>
                                                            changeStatus(
                                                                order,
                                                                e.target
                                                                    .value as OrderStatus,
                                                            )
                                                        }
                                                        className={inlineSelectClasses}
                                                        aria-label={t(
                                                            'Status of {number}',
                                                            {
                                                                number: order.order_number,
                                                            },
                                                        )}
                                                    >
                                                        {Object.entries(
                                                            statuses,
                                                        ).map(
                                                            ([
                                                                value,
                                                                label,
                                                            ]) => (
                                                                <option
                                                                    key={value}
                                                                    value={value}
                                                                >
                                                                    {t(label)}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <Link
                                                                href={showOrder(
                                                                    {
                                                                        order: order.id,
                                                                    },
                                                                )}
                                                            >
                                                                <Eye className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'View {name}',
                                                                        {
                                                                            name: order.order_number,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white shadow-lg shadow-fuchsia-500/30">
                                    <ShoppingCart className="size-7" />
                                </div>
                                <h2 className="text-lg font-semibold">
                                    {t('No orders found')}
                                </h2>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    {hasFilters
                                        ? t(
                                              'Try a different search term.',
                                          )
                                        : t(
                                              'Orders placed from your storefront will appear here.',
                                          )}
                                </p>
                            </div>
                        )}

                        {orders.last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
                                <p className="text-sm text-muted-foreground">
                                    {t('Showing {from} to {to} of {total}', {
                                        from: orders.from as number,
                                        to: orders.to as number,
                                        total: orders.total,
                                    })}
                                </p>
                                <div className="flex items-center gap-1">
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
                                                    isActive
                                                        ? 'default'
                                                        : 'ghost'
                                                }
                                                size="sm"
                                                className="size-8 px-0"
                                            >
                                                <Link
                                                    href={ordersIndex.url({
                                                        query: {
                                                            page,
                                                            ...sortQuery,
                                                        },
                                                    })}
                                                    preserveScroll
                                                >
                                                    {page}
                                                </Link>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

OrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Orders',
            href: ordersIndex(),
        },
    ],
};
