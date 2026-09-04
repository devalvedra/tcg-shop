import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    MapPin,
    Pencil,
    Star,
    Trash2,
    UserRound,
} from 'lucide-react';
import CustomerController from '@/actions/App/Http/Controllers/Admin/CustomerController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import {
    edit as editCustomer,
    index as customersIndex,
} from '@/routes/admin/customers';
import { show as showOrder } from '@/routes/admin/orders';
import type { Address, OrderStatus, User } from '@/types';

type OrderSummary = {
    id: number;
    order_number: string;
    items_count: number;
    total: string;
    status: OrderStatus;
    created_at: string;
};

type Props = {
    customer: User;
    addresses: Address[];
    orders: OrderSummary[];
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

export default function ShowCustomer({
    customer,
    addresses,
    orders,
    statuses,
}: Props) {
    return (
        <>
            <Head title={customer.name} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={customersIndex()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to customers')}
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                            {customer.name
                                .split(' ')
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join('')
                                .toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {customer.name}
                            </h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                {customer.phone}
                                {customer.email ? ` • ${customer.email}` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link
                                href={editCustomer({
                                    customer: customer.id,
                                })}
                            >
                                <Pencil className="size-4" />
                                {t('Edit')}
                            </Link>
                        </Button>
                        <Form
                            {...CustomerController.destroy.form({
                                customer: customer.id,
                            })}
                            onSubmit={(e) => {
                                if (
                                    !window.confirm(
                                        t(
                                            'Delete {name}? This cannot be undone.',
                                            {
                                                name: customer.name,
                                            },
                                        ),
                                    )
                                ) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <Button
                                type="submit"
                                variant="outline"
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                                <Trash2 className="size-4" />
                                {t('Delete')}
                            </Button>
                        </Form>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <UserRound className="size-4" />
                                    {t('Account')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Name')}
                                    </p>
                                    <p className="font-medium">
                                        {customer.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Phone')}
                                    </p>
                                    <p className="font-medium">
                                        {customer.phone ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Email')}
                                    </p>
                                    <p className="font-medium">
                                        {customer.email ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Joined')}
                                    </p>
                                    <p className="font-medium">
                                        {new Date(
                                            customer.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MapPin className="size-4" />
                                    {t('Shipping addresses')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {addresses.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {addresses.map((address) => (
                                            <div
                                                key={address.id}
                                                className="flex items-start gap-3 rounded-xl border p-4"
                                            >
                                                <MapPin className="mt-0.5 size-4 shrink-0 text-indigo-600" />
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-medium">
                                                            {
                                                                address.receiver_name
                                                            }
                                                        </p>
                                                        {address.is_default && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                                                                <Star className="size-3" />
                                                                {t('Default')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                                        {address.label}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                        {t('No shipping addresses on file.')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('Recent orders')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {orders.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {orders.map((order) => (
                                        <Link
                                            key={order.id}
                                            href={showOrder({
                                                order: order.id,
                                            })}
                                            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-mono text-xs font-medium">
                                                    {order.order_number}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {new Date(
                                                        order.created_at,
                                                    ).toLocaleDateString()}{' '}
                                                    • {order.items_count}{' '}
                                                    {order.items_count === 1
                                                        ? t('item')
                                                        : t('items')}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1">
                                                <span className="text-sm font-semibold">
                                                    {formatCurrency(
                                                        order.total,
                                                    )}
                                                </span>
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${statusStyles[order.status]}`}
                                                >
                                                    {t(
                                                        statuses[
                                                            order.status
                                                        ] ?? order.status,
                                                    )}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="p-6 text-center text-sm text-muted-foreground">
                                    {t('No orders yet.')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

ShowCustomer.layout = {
    breadcrumbs: [
        {
            title: 'Customers',
            href: customersIndex(),
        },
        {
            title: 'Customer Details',
            href: customersIndex(),
        },
    ],
};
