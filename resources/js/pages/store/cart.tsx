import { Head, Link, router } from '@inertiajs/react';
import { Minus, Package, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { categoryIconMap } from '@/components/store/product-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import { catalog } from '@/routes';
import { destroy as removeFromCart, update as updateCart } from '@/routes/cart';
import { index as checkout } from '@/routes/checkout';
import { show as showProduct } from '@/routes/products';
import type { CartItem } from '@/types';

type Props = {
    cartItems: CartItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    downPayment: number;
    freeShippingThreshold: number;
};

function DownPaymentCell({ item }: { item: CartItem }) {
    return (
        <div className="mt-2 grid gap-1">
            <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {formatCurrency(item.down_payment)}
                </span>
                <span className="text-[10px] font-medium tracking-wide text-amber-600 uppercase dark:text-amber-400">
                    {t('Down payment')}
                </span>
            </div>
            {item.down_payment > 0 && (
                <p className="text-[10px] text-muted-foreground">
                    {t('You have to pay down payment for this product')}
                </p>
            )}
        </div>
    );
}

function QuantityInput({
    item,
    onQuantityChange,
}: {
    item: CartItem;
    onQuantityChange: (quantity: number) => void;
}) {
    const max = Math.max(1, item.product.stock);
    const [value, setValue] = useState(String(item.quantity));

    const commit = () => {
        const trimmed = value.trim();

        if (trimmed === '') {
            setValue(String(item.quantity));

            return;
        }

        const parsed = Number(trimmed);

        if (!Number.isFinite(parsed)) {
            setValue(String(item.quantity));

            return;
        }

        const next = Math.max(1, Math.min(Math.floor(parsed), max));
        setValue(String(next));

        if (next !== item.quantity) {
            onQuantityChange(next);
        }
    };

    const stepBy = (delta: number) => {
        const next = Math.max(1, Math.min(item.quantity + delta, max));
        setValue(String(next));
        onQuantityChange(next);
    };

    return (
        <div className="flex items-center gap-1">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => stepBy(-1)}
                disabled={item.quantity <= 1}
                aria-label={t('Decrease quantity')}
            >
                <Minus className="size-4" />
            </Button>
            <Input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\D+/g, ''))}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        commit();
                    }
                }}
                aria-label={t('Quantity of {name}', {
                    name: item.product.name,
                })}
                className="h-8 w-14 text-center"
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => stepBy(1)}
                disabled={item.quantity >= max}
                aria-label={t('Increase quantity')}
            >
                <Plus className="size-4" />
            </Button>
        </div>
    );
}

export default function Cart({
    cartItems,
    subtotal,
    shippingFee,
    total,
    downPayment,
    freeShippingThreshold,
}: Props) {
    const updateQuantity = (item: CartItem, quantity: number) => {
        if (quantity < 1) {
            return;
        }

        router.patch(
            updateCart.url({ product: item.product.id }),
            { quantity },
            { preserveScroll: true },
        );
    };

    const removeItem = (item: CartItem) => {
        router.delete(removeFromCart.url({ product: item.product.id }), {
            preserveScroll: true,
        });
    };

    const remainingForFreeShipping = Math.max(
        0,
        freeShippingThreshold - subtotal,
    );

    return (
        <>
            <Head title={t('Your Cart')} />

            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
                <h1 className="text-3xl font-semibold tracking-tight">
                    {t('Your cart')}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t('Review your items before checking out')}
                </p>

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-24 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                            <ShoppingCart className="size-7" />
                        </div>
                        <h2 className="text-lg font-semibold">
                            {t('Your cart is empty')}
                        </h2>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {t(
                                'Browse the catalog and add your favorite cards and products.',
                            )}
                        </p>
                        <Button asChild className="mt-2">
                            <Link href={catalog()}>
                                {t('Browse the catalog')}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <Card className="gap-0 lg:col-span-2">
                            <CardContent className="divide-y p-0">
                                {cartItems.map((item) => {
                                    const Icon =
                                        categoryIconMap[
                                            item.product.category
                                        ] ?? Package;
                                    const image = item.product.images[0]?.url;

                                    return (
                                        <div
                                            key={item.product.id}
                                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-4">
                                                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/50 dark:to-violet-950/50">
                                                    {image ? (
                                                        <img
                                                            src={image}
                                                            alt={
                                                                item.product
                                                                    .name
                                                            }
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <Icon className="size-8 text-indigo-600" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        href={showProduct({
                                                            product:
                                                                item.product
                                                                    .slug,
                                                        })}
                                                        className="truncate font-medium hover:underline"
                                                    >
                                                        {item.product.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            item.product
                                                                .category_name
                                                        }
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium">
                                                        {formatCurrency(
                                                            item.unit_price,
                                                        )}
                                                    </p>
                                                    {item.down_payment > 0 && (
                                                        <DownPaymentCell
                                                            key={`${item.product.id}-${item.quantity}`}
                                                            item={item}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                                                <QuantityInput
                                                    key={`${item.product.id}-${item.quantity}-${item.product.stock}`}
                                                    item={item}
                                                    onQuantityChange={(
                                                        quantity,
                                                    ) =>
                                                        updateQuantity(
                                                            item,
                                                            quantity,
                                                        )
                                                    }
                                                />

                                                <div className="hidden w-20 text-right text-sm font-semibold sm:block">
                                                    {formatCurrency(
                                                        item.subtotal,
                                                    )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-rose-600"
                                                    onClick={() =>
                                                        removeItem(item)
                                                    }
                                                    aria-label={t(
                                                        'Remove {name}',
                                                        {
                                                            name: item.product
                                                                .name,
                                                        },
                                                    )}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card className="h-fit">
                            <CardContent className="flex flex-col gap-4">
                                <h2 className="text-lg font-semibold">
                                    {t('Order summary')}
                                </h2>

                                <div className="flex flex-col gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('Subtotal')}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('Shipping')}
                                        </span>
                                        {shippingFee === 0 ? (
                                            <span className="font-medium text-emerald-600">
                                                {t('Free')}
                                            </span>
                                        ) : (
                                            <span className="font-medium">
                                                {formatCurrency(shippingFee)}
                                            </span>
                                        )}
                                    </div>
                                    {downPayment > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t('Down payment')}
                                            </span>
                                            <span className="font-medium text-amber-600 dark:text-amber-400">
                                                {formatCurrency(downPayment)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="mt-1 flex justify-between border-t pt-3 text-base font-semibold">
                                        <span>{t('Total')}</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                </div>

                                {shippingFee > 0 ? (
                                    <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                                        {t(
                                            'Add {amount} more to unlock free shipping.',
                                            {
                                                amount: formatCurrency(
                                                    remainingForFreeShipping,
                                                ),
                                            },
                                        )}
                                    </p>
                                ) : (
                                    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                                        {t('You have unlocked free shipping!')}
                                    </p>
                                )}

                                <Button asChild size="lg">
                                    <Link href={checkout()}>
                                        {t('Proceed to checkout')}
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
