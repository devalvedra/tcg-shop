import { Link, useForm } from '@inertiajs/react';
import { Percent, Wallet } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import {
    index as promoCodesIndex,
    store,
    update,
} from '@/routes/admin/promo-codes';
import type { PromoCode } from '@/types';

type Props = {
    promoCode?: PromoCode;
};

type PromoCodeFormData = {
    code: string;
    name: string;
    description: string;
    discount_type: 'percent' | 'fixed';
    discount_value: string;
    min_subtotal: string;
    max_discount: string;
    usage_limit: string;
    starts_at: string;
    expires_at: string;
    is_active: boolean;
};

export function PromoCodeForm({ promoCode }: Props) {
    const isEdit = Boolean(promoCode);

    const form = useForm<PromoCodeFormData>({
        code: promoCode?.code ?? '',
        name: promoCode?.name ?? '',
        description: promoCode?.description ?? '',
        discount_type: promoCode?.discount_type ?? 'percent',
        discount_value: promoCode?.discount_value?.toString() ?? '',
        min_subtotal: promoCode?.min_subtotal?.toString() ?? '0',
        max_discount: promoCode?.max_discount?.toString() ?? '',
        usage_limit: promoCode?.usage_limit?.toString() ?? '',
        starts_at: promoCode?.starts_at ? promoCode.starts_at.slice(0, 10) : '',
        expires_at: promoCode?.expires_at
            ? promoCode.expires_at.slice(0, 10)
            : '',
        is_active: promoCode?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            form.put(update.url({ promo_code: promoCode!.id }));
        } else {
            form.post(store.url());
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-6">
            <Card>
                <CardContent className="grid gap-4 pt-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="code">
                                {t('Promo code')}{' '}
                                <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="code"
                                name="code"
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData(
                                        'code',
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="SUMMER10"
                                autoFocus
                                required
                                className="mt-1 font-mono uppercase"
                            />
                            <InputError message={form.errors.code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                {t('Name')}{' '}
                                <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="Summer sale 10% off"
                                required
                                className="mt-1"
                            />
                            <InputError message={form.errors.name} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">{t('Description')}</Label>
                        <Input
                            id="description"
                            name="description"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            placeholder={t(
                                'Shown to customers when they apply the code',
                            )}
                            className="mt-1"
                        />
                        <InputError message={form.errors.description} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="grid gap-4 pt-6">
                    <div className="grid gap-2">
                        <Label>
                            {t('Discount type')}{' '}
                            <span className="text-rose-500">*</span>
                        </Label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                                    form.data.discount_type === 'percent'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                                        : 'hover:bg-muted/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="discount_type"
                                    value="percent"
                                    checked={
                                        form.data.discount_type === 'percent'
                                    }
                                    onChange={() =>
                                        form.setData('discount_type', 'percent')
                                    }
                                    className="size-4 accent-indigo-600"
                                />
                                <Percent className="size-4 text-indigo-600" />
                                <span className="text-sm font-medium">
                                    {t('Percent off')}
                                </span>
                            </label>
                            <label
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                                    form.data.discount_type === 'fixed'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                                        : 'hover:bg-muted/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="discount_type"
                                    value="fixed"
                                    checked={
                                        form.data.discount_type === 'fixed'
                                    }
                                    onChange={() =>
                                        form.setData('discount_type', 'fixed')
                                    }
                                    className="size-4 accent-indigo-600"
                                />
                                <Wallet className="size-4 text-indigo-600" />
                                <span className="text-sm font-medium">
                                    {t('Fixed amount')}
                                </span>
                            </label>
                        </div>
                        <InputError message={form.errors.discount_type} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="discount_value">
                                {form.data.discount_type === 'percent'
                                    ? t('Percent off')
                                    : t('Amount off')}{' '}
                                <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="discount_value"
                                name="discount_value"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={
                                    form.data.discount_type === 'percent'
                                        ? '100'
                                        : undefined
                                }
                                value={form.data.discount_value}
                                onChange={(e) =>
                                    form.setData(
                                        'discount_value',
                                        e.target.value,
                                    )
                                }
                                placeholder={
                                    form.data.discount_type === 'percent'
                                        ? '10'
                                        : '5.00'
                                }
                                required
                                className="mt-1"
                            />
                            <InputError message={form.errors.discount_value} />
                        </div>

                        {form.data.discount_type === 'percent' && (
                            <div className="grid gap-2">
                                <Label htmlFor="max_discount">
                                    {t('Maximum discount')}
                                </Label>
                                <Input
                                    id="max_discount"
                                    name="max_discount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.data.max_discount}
                                    onChange={(e) =>
                                        form.setData(
                                            'max_discount',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={t('Optional cap, e.g. 25.00')}
                                    className="mt-1"
                                />
                                <InputError
                                    message={form.errors.max_discount}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="min_subtotal">
                                {t('Minimum subtotal')}
                            </Label>
                            <Input
                                id="min_subtotal"
                                name="min_subtotal"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.min_subtotal}
                                onChange={(e) =>
                                    form.setData('min_subtotal', e.target.value)
                                }
                                placeholder="0.00"
                                className="mt-1"
                            />
                            <InputError message={form.errors.min_subtotal} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="usage_limit">
                                {t('Usage limit')}
                            </Label>
                            <Input
                                id="usage_limit"
                                name="usage_limit"
                                type="number"
                                step="1"
                                min="1"
                                value={form.data.usage_limit}
                                onChange={(e) =>
                                    form.setData('usage_limit', e.target.value)
                                }
                                placeholder={t('Leave empty for unlimited')}
                                className="mt-1"
                            />
                            <InputError message={form.errors.usage_limit} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="starts_at">{t('Starts at')}</Label>
                            <Input
                                id="starts_at"
                                name="starts_at"
                                type="date"
                                value={form.data.starts_at}
                                onChange={(e) =>
                                    form.setData('starts_at', e.target.value)
                                }
                                className="mt-1"
                            />
                            <InputError message={form.errors.starts_at} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="expires_at">
                                {t('Expires at')}
                            </Label>
                            <Input
                                id="expires_at"
                                name="expires_at"
                                type="date"
                                value={form.data.expires_at}
                                onChange={(e) =>
                                    form.setData('expires_at', e.target.value)
                                }
                                className="mt-1"
                            />
                            <InputError message={form.errors.expires_at} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            name="is_active"
                            checked={form.data.is_active}
                            onCheckedChange={(checked) =>
                                form.setData('is_active', checked === true)
                            }
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            {t('Customers can redeem this code')}
                        </Label>
                    </div>
                    <InputError message={form.errors.is_active} />
                </CardContent>
            </Card>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={form.processing}>
                    {isEdit ? t('Update promo code') : t('Create promo code')}
                </Button>
                <Button asChild variant="ghost">
                    <Link href={promoCodesIndex()}>{t('Cancel')}</Link>
                </Button>
            </div>
        </form>
    );
}
