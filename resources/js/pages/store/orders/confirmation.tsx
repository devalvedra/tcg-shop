import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import { catalog } from '@/routes';
import type { Order } from '@/types';

type Props = {
    order: Order;
    paymentMethods: Record<string, string>;
};

export default function OrderConfirmation({ order, paymentMethods }: Props) {
    const placedAt = new Date(order.created_at).toLocaleString();
    const shippingLabel = [
        order.shipping_address,
        order.shipping_city,
        order.shipping_zip,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <>
            <Head title={t('Order Confirmed')} />

            <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircle2 className="size-9" />
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {t('Order placed!')}
                    </h1>
                    <p className="max-w-md text-sm text-muted-foreground">
                        {t(
                            'Thanks for your order. Your confirmation number is',
                        )}{' '}
                        <strong className="text-foreground">
                            {order.order_number}
                        </strong>{' '}
                        {t('and we have received your payment request.')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {t('Placed on {date}', { date: placedAt })}
                    </p>
                </div>

                <Card className="mt-8">
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {t('Items')}
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                {order.payment_method
                                    ? t(
                                          paymentMethods[
                                              order.payment_method
                                          ] ?? order.payment_method,
                                      )
                                    : '—'}
                            </span>
                        </div>

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
                            {Number(order.down_payment) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t('Down payment')}
                                    </span>
                                    <span className="font-medium text-amber-600 dark:text-amber-400">
                                        {formatCurrency(order.down_payment)}
                                    </span>
                                </div>
                            )}
                            <div className="mt-1 flex justify-between border-t pt-3 text-base font-semibold">
                                <span>{t('Total')}</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 flex justify-center">
                    <Button asChild>
                        <Link href={catalog()}>{t('Continue shopping')}</Link>
                    </Button>
                </div>

                {shippingLabel && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4 shrink-0" />
                        <span>
                            {t('Shipping to')}{' '}
                            <strong>{order.receiver_name ?? t('you')}</strong> ·{' '}
                            {shippingLabel}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}
