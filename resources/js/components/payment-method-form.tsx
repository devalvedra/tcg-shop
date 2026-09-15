import { Link, useForm } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import {
    index as paymentMethodsIndex,
    store,
    update,
} from '@/routes/admin/payment-methods';
import type { PaymentMethodOption } from '@/types';

type Props = {
    paymentMethod?: PaymentMethodOption;
};

type PaymentMethodFormData = {
    name: string;
    account_name: string;
    code: string;
    is_active: boolean;
};

const nativeSelectClasses =
    'mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

export function PaymentMethodForm({ paymentMethod }: Props) {
    const isEdit = Boolean(paymentMethod);

    const form = useForm<PaymentMethodFormData>({
        name: paymentMethod?.name ?? '',
        account_name: paymentMethod?.account_name ?? '',
        code: paymentMethod?.code ?? '',
        is_active: paymentMethod?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            form.put(update.url({ payment_method: paymentMethod!.id }));
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
                                autoFocus
                                required
                                className="mt-1"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="account_name">
                                {t('Account name')}
                            </Label>
                            <Input
                                id="account_name"
                                name="account_name"
                                value={form.data.account_name}
                                onChange={(e) =>
                                    form.setData('account_name', e.target.value)
                                }
                                className="mt-1"
                            />
                            <InputError message={form.errors.account_name} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="code">
                            {t('Payment code / number')}{' '}
                            <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="code"
                            name="code"
                            value={form.data.code}
                            onChange={(e) =>
                                form.setData('code', e.target.value)
                            }
                            required
                            className="mt-1 font-mono"
                        />
                        <InputError message={form.errors.code} />
                        <p className="text-xs text-muted-foreground">
                            {t(
                                'The number customers use to pay (e.g., GCash number or bank account number). Shown on the checkout page and copied on order.',
                            )}
                        </p>
                    </div>

                    <div className="grid gap-2 sm:max-w-xs">
                        <Label htmlFor="is_active">{t('Status')}</Label>
                        <select
                            id="is_active"
                            name="is_active"
                            value={form.data.is_active ? '1' : '0'}
                            onChange={(e) =>
                                form.setData(
                                    'is_active',
                                    e.target.value === '1',
                                )
                            }
                            className={nativeSelectClasses}
                        >
                            <option value="1">{t('Active')}</option>
                            <option value="0">{t('Not active')}</option>
                        </select>
                        <InputError message={form.errors.is_active} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={form.processing}>
                    <CreditCard className="size-4" />
                    {isEdit
                        ? t('Update payment method')
                        : t('Create payment method')}
                </Button>
                <Button asChild variant="ghost">
                    <Link href={paymentMethodsIndex()}>{t('Cancel')}</Link>
                </Button>
            </div>
        </form>
    );
}
