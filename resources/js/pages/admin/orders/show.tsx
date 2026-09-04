import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CreditCard, MapPin, Package, User } from 'lucide-react';
import OrderController from '@/actions/App/Http/Controllers/Admin/OrderController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import { index as ordersIndex } from '@/routes/admin/orders';
import type { Order, OrderStatus, PaymentStatus } from '@/types';

type Props = {
    order: Order;
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

const nativeSelectClasses =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

export default function ShowOrder({
    order,
    statuses,
    paymentMethods,
    paymentStatuses,
    downPaymentStatuses,
}: Props) {
    return (
        <>
            <Head title={t('Order {number}', { number: order.order_number })} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={ordersIndex()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to orders')}
                    </Link>
                </Button>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {order.order_number}
                            </h1>
                            <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[order.status]}`}
                            >
                                {t(statuses[order.status] ?? order.status)}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Placed {date}', {
                                date: new Date(
                                    order.created_at,
                                ).toLocaleString(),
                            })}
                        </p>
                    </div>
                    <p className="text-2xl font-semibold tracking-tight">
                        {formatCurrency(order.total)}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {t('Items')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-xs text-muted-foreground">
                                                <th className="px-4 py-3 font-medium">
                                                    {t('Product')}
                                                </th>
                                                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                                    {t('Price')}
                                                </th>
                                                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                                                    {t('Qty')}
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    {t('Subtotal')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {order.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {item.product_image_url ? (
                                                                <img
                                                                    src={
                                                                        item.product_image_url
                                                                    }
                                                                    alt={
                                                                        item.product_name
                                                                    }
                                                                    className="size-9 shrink-0 rounded-lg border object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                                                                    <Package className="size-4" />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium">
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </p>
                                                                <p className="truncate text-xs text-muted-foreground">
                                                                    {t(
                                                                        'SKU #{id}',
                                                                        {
                                                                            id: item.id,
                                                                        },
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="hidden px-4 py-3 sm:table-cell">
                                                        {formatCurrency(
                                                            item.unit_price,
                                                        )}
                                                    </td>
                                                    <td className="hidden px-4 py-3 sm:table-cell">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {formatCurrency(
                                                            item.subtotal,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="border-t p-4">
                                    <dl className="ml-auto flex w-full max-w-xs flex-col gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">
                                                {t('Subtotal')}
                                            </dt>
                                            <dd>
                                                {formatCurrency(order.subtotal)}
                                            </dd>
                                        </div>
                                        {Number(order.down_payment) > 0 && (
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">
                                                    {t('Down payment')}
                                                </dt>
                                                <dd>
                                                    {formatCurrency(
                                                        order.down_payment,
                                                    )}
                                                </dd>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">
                                                {t('Shipping')}
                                            </dt>
                                            <dd>
                                                {formatCurrency(
                                                    order.shipping_fee,
                                                )}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">
                                                {t('Discount')}
                                            </dt>
                                            <dd className="text-emerald-600">
                                                -
                                                {formatCurrency(order.discount)}
                                            </dd>
                                        </div>
                                        {order.promo_code && (
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">
                                                    {t('Promo code')}
                                                </dt>
                                                <dd className="font-mono text-xs font-semibold tracking-wide">
                                                    {order.promo_code.code}
                                                </dd>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t pt-2 font-medium">
                                            <dt>{t('Total')}</dt>
                                            <dd>
                                                {formatCurrency(order.total)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <CreditCard className="size-4" />
                                    {t('Update order')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <Form
                                    {...OrderController.update.form({
                                        order: order.id,
                                    })}
                                    className="flex flex-col gap-4"
                                >
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="status">
                                            {t('Status')}
                                        </Label>
                                        <select
                                            id="status"
                                            name="status"
                                            defaultValue={order.status}
                                            className={nativeSelectClasses}
                                        >
                                            {Object.entries(statuses).map(
                                                ([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {t(label)}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="payment_status">
                                            {t('Payment')}
                                        </Label>
                                        <select
                                            id="payment_status"
                                            name="payment_status"
                                            defaultValue={order.payment_status}
                                            className={nativeSelectClasses}
                                        >
                                            {Object.entries(
                                                paymentStatuses,
                                            ).map(([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {t(label)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {Number(order.down_payment) > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="down_payment_status">
                                                {t('Down payment')}
                                            </Label>
                                            <select
                                                id="down_payment_status"
                                                name="down_payment_status"
                                                defaultValue={
                                                    order.down_payment_status
                                                }
                                                className={nativeSelectClasses}
                                            >
                                                {Object.entries(
                                                    downPaymentStatuses,
                                                ).map(([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {t(label)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <Button type="submit" className="w-full">
                                        {t('Save changes')}
                                    </Button>
                                </Form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="size-4" />
                                    {t('Customer')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-1 text-sm">
                                <p className="font-medium">
                                    {order.customer.name}
                                </p>
                                <p className="text-muted-foreground">
                                    {order.customer.phone}
                                </p>
                                {order.customer.email && (
                                    <p className="text-muted-foreground">
                                        {order.customer.email}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MapPin className="size-4" />
                                    {t('Shipping')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-1 text-sm">
                                {order.receiver_name && (
                                    <p className="font-medium">
                                        {order.receiver_name}
                                    </p>
                                )}
                                {order.shipping_address ||
                                order.shipping_city ||
                                order.shipping_zip ? (
                                    <>
                                        {order.shipping_address && (
                                            <p className="text-muted-foreground">
                                                {order.shipping_address}
                                            </p>
                                        )}
                                        {(order.shipping_city ||
                                            order.shipping_zip) && (
                                            <p className="text-muted-foreground">
                                                {[
                                                    order.shipping_city,
                                                    order.shipping_zip,
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground">
                                        {t('No shipping address on file.')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {t('Payment')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('Method')}
                                    </span>
                                    <span>
                                        {order.payment_method
                                            ? (paymentMethods[
                                                  order.payment_method
                                              ] ?? order.payment_method)
                                            : '—'}
                                    </span>
                                </div>
                                {Number(order.down_payment) > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            {t('Down payment')}
                                        </span>
                                        <span>
                                            {formatCurrency(order.down_payment)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('Status')}
                                    </span>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${paymentStyles[order.payment_status]}`}
                                    >
                                        {paymentStatuses[
                                            order.payment_status
                                        ] ?? order.payment_status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {order.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {t('Notes')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {order.notes}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ShowOrder.layout = {
    breadcrumbs: [
        {
            title: 'Orders',
            href: ordersIndex(),
        },
        {
            title: 'Order Details',
            href: ordersIndex(),
        },
    ],
};
