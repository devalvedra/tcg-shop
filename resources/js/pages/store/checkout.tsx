import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Copy,
    MapPin,
    Package,
    Plus,
    Star,
    Ticket,
    X,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { categoryIconMap } from '@/components/store/product-card';
import { RegionFields } from '@/components/store/region-fields';
import type { RegionOption } from '@/components/store/region-fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import { store as addressStore } from '@/routes/addresses';
import { index as cart } from '@/routes/cart';
import { store as checkoutStore } from '@/routes/checkout';
import { apply as applyPromo, remove as removePromo } from '@/routes/promo';
import type { Address, CartItem, PaymentMethodOption } from '@/types';

type PromoInfo = {
    code: string;
    name: string;
    discount: number;
};

type Props = {
    cartItems: CartItem[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    downPayment: number;
    total: number;
    paymentMethods: PaymentMethodOption[];
    promo: PromoInfo | null;
    customerName: string;
    addresses: Address[];
    provinces: RegionOption[];
};

export default function Checkout({
    cartItems,
    subtotal,
    shippingFee,
    discount,
    downPayment,
    total,
    paymentMethods,
    promo,
    addresses,
    provinces,
}: Props) {
    const defaultAddress =
        addresses.find((address) => address.is_default) ?? addresses[0] ?? null;

    const form = useForm({
        address_id: defaultAddress?.id ?? null,
        payment_method: paymentMethods[0]?.code ?? '',
        notes: '',
    });

    const [showAddressDialog, setShowAddressDialog] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const addressForm = useForm<{
        receiver_name: string;
        address: string;
        province: string;
        city: string;
        district: string;
        subdistrict: string;
        zip: string;
        is_default: boolean;
    }>({
        receiver_name: '',
        address: '',
        province: '',
        city: '',
        district: '',
        subdistrict: '',
        zip: '',
        is_default: true,
    });

    const closeAddressDialog = () => {
        setShowAddressDialog(false);
        addressForm.reset();
        addressForm.clearErrors();
    };

    const submitAddress = (event: React.FormEvent) => {
        event.preventDefault();

        addressForm.post(addressStore.url(), {
            preserveScroll: true,
            onSuccess: (page) => {
                closeAddressDialog();

                const list = (page.props.addresses ?? []) as Address[];
                const newest = list.reduce<Address | null>(
                    (latest, address) =>
                        !latest || address.id > latest.id ? address : latest,
                    null,
                );

                if (newest) {
                    form.setData('address_id', newest.id);
                }
            },
        });
    };

    const selectedPaymentMethod =
        paymentMethods.find(
            (method) => method.code === form.data.payment_method,
        ) ?? null;

    const hasPaymentCode =
        selectedPaymentMethod !== null && /\d/.test(selectedPaymentMethod.code);

    const copyPaymentCode = async () => {
        if (!selectedPaymentMethod) {
            return;
        }

        await navigator.clipboard.writeText(selectedPaymentMethod.code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const promoForm = useForm({ code: '' });

    const placeOrder = () => {
        form.post(checkoutStore.url(), { preserveScroll: true });
    };

    const applyPromoCode = (event: React.FormEvent) => {
        event.preventDefault();
        promoForm.post(applyPromo.url(), { preserveScroll: true });
    };

    const removeAppliedPromo = () => {
        router.delete(removePromo.url(), { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('Checkout')} />

            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={cart()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to cart')}
                    </Link>
                </Button>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                    {t('Checkout')}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t(
                        'Confirm your shipping address and payment method to place your order',
                    )}
                </p>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        placeOrder();
                    }}
                    className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <Card>
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                                        <MapPin className="size-5 text-indigo-600" />
                                        {t('Shipping address')}
                                    </h2>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setShowAddressDialog(true)
                                        }
                                    >
                                        <Plus className="size-4" />
                                        {t('Add new address')}
                                    </Button>
                                </div>

                                {addresses.length === 0 ? (
                                    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-4">
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                'You need a shipping address before placing an order.',
                                            )}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setShowAddressDialog(true)
                                            }
                                        >
                                            <Plus className="size-4" />
                                            {t('Add new address')}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {addresses.map((address) => {
                                            const selected =
                                                form.data.address_id ===
                                                address.id;

                                            return (
                                                <label
                                                    key={address.id}
                                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                                        selected
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                                                            : 'hover:bg-muted/50'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="address_id"
                                                        value={address.id}
                                                        checked={selected}
                                                        onChange={() =>
                                                            form.setData(
                                                                'address_id',
                                                                address.id,
                                                            )
                                                        }
                                                        className="mt-0.5 size-4 accent-indigo-600"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-sm font-medium">
                                                                {
                                                                    address.receiver_name
                                                                }
                                                            </span>
                                                            {address.is_default && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                                                                    <Star className="size-3" />
                                                                    {t(
                                                                        'Default',
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {address.label}
                                                        </p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                <InputError message={form.errors.address_id} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex flex-col gap-4">
                                <h2 className="text-lg font-semibold">
                                    {t('Payment method')}
                                </h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {paymentMethods.map((method) => {
                                        const selected =
                                            form.data.payment_method ===
                                            method.code;

                                        return (
                                            <label
                                                key={method.id}
                                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                                    selected
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                                                        : 'hover:bg-muted/50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value={method.code}
                                                    checked={selected}
                                                    onChange={() =>
                                                        form.setData(
                                                            'payment_method',
                                                            method.code,
                                                        )
                                                    }
                                                    className="mt-0.5 size-4 accent-indigo-600"
                                                />
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-medium">
                                                        {method.name}
                                                    </span>
                                                    {method.account_name && (
                                                        <span className="mt-0.5 block text-xs text-muted-foreground">
                                                            {
                                                                method.account_name
                                                            }
                                                        </span>
                                                    )}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {hasPaymentCode && (
                                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/50 px-3 py-2.5">
                                        <div className="min-w-0">
                                            <p className="text-xs text-muted-foreground">
                                                {t('Payment code')}
                                            </p>
                                            <p className="truncate font-mono text-sm font-semibold">
                                                {selectedPaymentMethod.code}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="shrink-0"
                                            onClick={copyPaymentCode}
                                        >
                                            <Copy className="size-3.5" />
                                            {copiedCode
                                                ? t('Copied')
                                                : t('Copy')}
                                        </Button>
                                    </div>
                                )}
                                <InputError
                                    message={form.errors.payment_method}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex flex-col gap-3">
                                <h2 className="text-lg font-semibold">
                                    {t('Order notes')}
                                </h2>
                                <Label htmlFor="notes">
                                    {t('Add a note to your order (optional)')}
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={form.data.notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    rows={3}
                                    placeholder={t(
                                        'Special instructions for your order...',
                                    )}
                                />
                                <InputError message={form.errors.notes} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-6">
                        <Card className="h-fit">
                            <CardContent className="flex flex-col gap-4">
                                <h2 className="text-lg font-semibold">
                                    {t('Order summary')}
                                </h2>

                                <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
                                    {cartItems.map((item) => {
                                        const Icon =
                                            categoryIconMap[
                                                item.product.category
                                            ] ?? Package;
                                        const image =
                                            item.product.images[0]?.url;

                                        return (
                                            <div
                                                key={item.product.id}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/50 dark:to-violet-950/50">
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
                                                        <Icon className="size-5 text-indigo-600" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {item.product.name}
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
                                                    {item.down_payment > 0 && (
                                                        <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                                            {t(
                                                                'Down payment: {amount}',
                                                                {
                                                                    amount: formatCurrency(
                                                                        item.down_payment,
                                                                    ),
                                                                },
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-sm font-semibold">
                                                    {formatCurrency(
                                                        item.subtotal,
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col gap-2 border-t pt-3 text-sm">
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
                                    {discount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t('Discount')}
                                            </span>
                                            <span className="font-medium text-emerald-600">
                                                -{formatCurrency(discount)}
                                            </span>
                                        </div>
                                    )}
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

                                {downPayment > 0 && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                                        <p className="font-medium">
                                            {t(
                                                'The amount you have to pay is {amount}',
                                                {
                                                    amount: formatCurrency(
                                                        downPayment,
                                                    ),
                                                },
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 border-t pt-4">
                                    {promo ? (
                                        <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-500/40 bg-indigo-50 px-3 py-2 dark:bg-indigo-950/40">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Ticket className="size-4 shrink-0 text-indigo-600" />
                                                <div className="min-w-0">
                                                    <p className="truncate font-mono text-xs font-semibold tracking-wide">
                                                        {promo.code}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {promo.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 shrink-0"
                                                onClick={removeAppliedPromo}
                                            >
                                                <X className="size-3.5" />
                                                <span className="sr-only">
                                                    {t('Remove promo code')}
                                                </span>
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={applyPromoCode}>
                                            <Label htmlFor="promo_code">
                                                {t('Promo code')}
                                            </Label>
                                            <div className="mt-1 flex gap-2">
                                                <Input
                                                    id="promo_code"
                                                    name="code"
                                                    value={promoForm.data.code}
                                                    onChange={(e) =>
                                                        promoForm.setData(
                                                            'code',
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    placeholder="SUMMER10"
                                                    className="font-mono uppercase"
                                                />
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    disabled={
                                                        promoForm.processing
                                                    }
                                                >
                                                    {t('Apply')}
                                                </Button>
                                            </div>
                                            <InputError
                                                message={promoForm.errors.code}
                                            />
                                        </form>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={
                                        form.processing ||
                                        addresses.length === 0
                                    }
                                >
                                    {form.processing && <Spinner />}
                                    {t('Place order')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>

            <Dialog
                open={showAddressDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        closeAddressDialog();
                    } else {
                        setShowAddressDialog(true);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('Add new address')}</DialogTitle>
                        <DialogDescription>
                            {t(
                                'Enter the address where your order will be delivered.',
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitAddress} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="new_receiver_name">
                                {t('Receiver name')}
                            </Label>
                            <Input
                                id="new_receiver_name"
                                value={addressForm.data.receiver_name}
                                onChange={(event) =>
                                    addressForm.setData(
                                        'receiver_name',
                                        event.target.value,
                                    )
                                }
                                placeholder={t('Who will receive the package')}
                                required
                            />
                            <InputError
                                message={addressForm.errors.receiver_name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="new_address">
                                {t('Street address')}
                            </Label>
                            <Input
                                id="new_address"
                                value={addressForm.data.address}
                                onChange={(event) =>
                                    addressForm.setData(
                                        'address',
                                        event.target.value,
                                    )
                                }
                                placeholder={t('House number and street')}
                                required
                            />
                            <InputError message={addressForm.errors.address} />
                        </div>

                        <RegionFields
                            provinces={provinces}
                            value={{
                                province: addressForm.data.province,
                                city: addressForm.data.city,
                                district: addressForm.data.district,
                                subdistrict: addressForm.data.subdistrict,
                            }}
                            errors={addressForm.errors}
                            onChange={(field, value) =>
                                addressForm.setData(field, value)
                            }
                        />

                        <div className="grid gap-2 sm:max-w-xs">
                            <Label htmlFor="new_zip">{t('Postal code')}</Label>
                            <Input
                                id="new_zip"
                                value={addressForm.data.zip}
                                onChange={(event) =>
                                    addressForm.setData(
                                        'zip',
                                        event.target.value,
                                    )
                                }
                                placeholder={t('Postal code')}
                            />
                            <InputError message={addressForm.errors.zip} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="new_is_default"
                                checked={addressForm.data.is_default}
                                onCheckedChange={(checked) =>
                                    addressForm.setData(
                                        'is_default',
                                        checked === true,
                                    )
                                }
                            />
                            <Label
                                htmlFor="new_is_default"
                                className="font-normal"
                            >
                                {t('Set as default address')}
                            </Label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeAddressDialog}
                            >
                                {t('Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={addressForm.processing}
                            >
                                {addressForm.processing && <Spinner />}
                                {t('Save address')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
