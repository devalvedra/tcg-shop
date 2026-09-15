import { Form, Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Copy,
    Download,
    MapPin,
    MessageCircle,
    Package,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useClipboard } from '@/hooks/use-clipboard';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import {
    cancel,
    index as ordersIndex,
    invoice as invoiceRoute,
    notes as notesRoute,
} from '@/routes/orders';
import type { Order, OrderStatus, PaymentStatus } from '@/types';

type PaymentMethodDetails = {
    name: string;
    account_name: string | null;
    code: string;
};

type Props = {
    order: Order;
    statuses: Record<string, string>;
    paymentMethods: Record<string, string>;
    paymentStatuses: Record<string, string>;
    paymentMethodDetails: PaymentMethodDetails | null;
    whatsappNumber: string | null;
    cancelOrder: {
        enabled: boolean;
        hours: number;
        canCancel: boolean;
    };
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
    dp: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export default function ShowOrder({
    order,
    statuses,
    paymentMethods,
    paymentStatuses,
    paymentMethodDetails,
    whatsappNumber,
    cancelOrder,
}: Props) {
    const [copiedText, copy] = useClipboard();
    const notesForm = useForm({ notes: order.notes ?? '' });

    const shippingLabel = [
        order.shipping_address,
        order.shipping_subdistrict,
        order.shipping_district,
        order.shipping_city,
        order.shipping_province,
        order.shipping_zip,
    ]
        .filter(Boolean)
        .join(', ');

    const itemsText = order.items
        .map((item) => `${item.product_name} x${item.quantity}`)
        .join(', ');

    const messageLines = [
        t('Order number: {number}', { number: order.order_number }),
        t("Hello, I'm sending my order: {items}.", { items: itemsText }),
    ];

    if (Number(order.down_payment) > 0) {
        messageLines.push(
            t('I have paid DP: {amount}', {
                amount: formatCurrency(order.down_payment),
            }),
        );
    }

    const whatsappDigits = (whatsappNumber ?? '').replace(/\D/g, '');
    const whatsappLink = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
        messageLines.join('\n'),
    )}`;

    const saveNotes = (event: React.FormEvent) => {
        event.preventDefault();
        notesForm.put(notesRoute.url({ order: order.id }), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('Order {number}', { number: order.order_number })} />

            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={ordersIndex()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to my orders')}
                    </Link>
                </Button>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                        >
                            <a href={invoiceRoute.url({ order: order.id })}>
                                <Download className="size-4" />
                                {t('Download invoice')}
                            </a>
                        </Button>
                        {whatsappDigits && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle className="size-4" />
                                    {t('Send on WhatsApp')}
                                </a>
                            </Button>
                        )}
                        {cancelOrder.canCancel && (
                            <Form
                                {...cancel.form({ order: order.id })}
                                className="w-full sm:w-auto"
                                onSubmit={(e) => {
                                    if (
                                        !window.confirm(
                                            t(
                                                'Cancel this order? Stock will be returned to inventory.',
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
                                    size="sm"
                                    className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:w-auto"
                                >
                                    <XCircle className="size-4" />
                                    {t('Cancel order')}
                                </Button>
                            </Form>
                        )}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardContent className="flex flex-col gap-4 p-4">
                            <h2 className="text-base font-semibold">
                                {t('Items')}
                            </h2>
                            <div className="flex flex-col divide-y">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/50 dark:to-violet-950/50">
                                            {item.product_image_url ? (
                                                <img
                                                    src={item.product_image_url}
                                                    alt={item.product_name}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <Package className="size-5 text-indigo-600" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {item.product_name}
                                            </p>
                                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
                                                    ×{item.quantity}
                                                </span>
                                                <span>
                                                    {formatCurrency(
                                                        item.unit_price,
                                                    )}
                                                </span>
                                            </p>
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {formatCurrency(item.subtotal)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-2 border-t pt-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t('Subtotal')}
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(order.subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t('Shipping')}
                                    </span>
                                    {Number(order.shipping_fee) === 0 ? (
                                        <span className="font-medium text-emerald-600">
                                            {t('Free')}
                                        </span>
                                    ) : (
                                        <span className="font-medium">
                                            {formatCurrency(order.shipping_fee)}
                                        </span>
                                    )}
                                </div>
                                {Number(order.discount) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('Discount')}
                                        </span>
                                        <span className="font-medium text-emerald-600">
                                            -{formatCurrency(order.discount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                    <span>{t('Total')}</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>

                            {Number(order.down_payment) > 0 &&
                                order.payment_status === 'unpaid' && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                                        <p className="font-medium">
                                            {t(
                                                'The amount you have to pay is {amount}',
                                                {
                                                    amount: formatCurrency(
                                                        order.down_payment,
                                                    ),
                                                },
                                            )}
                                        </p>
                                    </div>
                                )}

                            {Number(order.down_payment) > 0 &&
                                order.payment_status === 'dp' && (
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                                        <p className="font-medium">
                                            {t(
                                                'You have paid DP: {paid}, please pay the remaining payment of: {remaining}',
                                                {
                                                    paid: formatCurrency(
                                                        order.down_payment,
                                                    ),
                                                    remaining: formatCurrency(
                                                        Number(order.total) -
                                                            Number(
                                                                order.down_payment,
                                                            ),
                                                    ),
                                                },
                                            )}
                                        </p>
                                    </div>
                                )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardContent className="flex flex-col gap-2 p-4 text-sm">
                                <h2 className="text-base font-semibold">
                                    {t('Payment')}
                                </h2>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {t('Method')}
                                    </span>
                                    <span>
                                        {paymentMethodDetails?.name ??
                                            (order.payment_method
                                                ? t(
                                                      paymentMethods[
                                                          order.payment_method
                                                      ] ?? order.payment_method,
                                                  )
                                                : '—')}
                                    </span>
                                </div>
                                {paymentMethodDetails?.account_name && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            {t('Account name')}
                                        </span>
                                        <span>
                                            {paymentMethodDetails.account_name}
                                        </span>
                                    </div>
                                )}
                                {paymentMethodDetails && (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-muted-foreground">
                                            {t('Account number')}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="font-mono">
                                                {paymentMethodDetails.code}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-6"
                                                onClick={() =>
                                                    copy(
                                                        paymentMethodDetails.code,
                                                    )
                                                }
                                                title={t('Copy account number')}
                                            >
                                                {copiedText ===
                                                paymentMethodDetails.code ? (
                                                    <Check className="size-3.5 text-emerald-600" />
                                                ) : (
                                                    <Copy className="size-3.5" />
                                                )}
                                            </Button>
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
                                        {t(
                                            paymentStatuses[
                                                order.payment_status
                                            ] ?? order.payment_status,
                                        )}
                                    </span>
                                </div>
                                {order.promo_code && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            {t('Promo code')}
                                        </span>
                                        <span className="font-mono text-xs font-semibold tracking-wide">
                                            {order.promo_code.code}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex flex-col gap-2 p-4 text-sm">
                                <h2 className="flex items-center gap-2 text-base font-semibold">
                                    <MapPin className="size-4" />
                                    {t('Shipping')}
                                </h2>
                                {order.receiver_name && (
                                    <p className="font-medium">
                                        {order.receiver_name}
                                    </p>
                                )}
                                {shippingLabel ? (
                                    <p className="text-muted-foreground">
                                        {shippingLabel}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground">
                                        {t('No shipping address on file.')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex flex-col gap-2 p-4 text-sm">
                                <h2 className="text-base font-semibold">
                                    {t('Notes')}
                                </h2>
                                <form
                                    onSubmit={saveNotes}
                                    className="flex flex-col gap-2"
                                >
                                    <Textarea
                                        value={notesForm.data.notes}
                                        onChange={(event) =>
                                            notesForm.setData(
                                                'notes',
                                                event.target.value,
                                            )
                                        }
                                        rows={3}
                                        placeholder={t(
                                            'Special instructions for your order...',
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="w-fit"
                                        disabled={notesForm.processing}
                                    >
                                        {t('Save notes')}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
