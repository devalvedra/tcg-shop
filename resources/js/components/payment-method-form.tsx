import { Link, useForm } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    code: string;
    description: string;
    instructions: string;
    is_active: boolean;
    sort_order: string;
};

export function PaymentMethodForm({ paymentMethod }: Props) {
    const isEdit = Boolean(paymentMethod);

    const form = useForm<PaymentMethodFormData>({
        name: paymentMethod?.name ?? '',
        code: paymentMethod?.code ?? '',
        description: paymentMethod?.description ?? '',
        instructions: paymentMethod?.instructions ?? '',
        is_active: paymentMethod?.is_active ?? true,
        sort_order: paymentMethod?.sort_order?.toString() ?? '0',
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
                                placeholder="GCash"
                                autoFocus
                                required
                                className="mt-1"
                            />
                            <InputError message={form.errors.name} />
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
                                placeholder="0917 123 4567 / bank account number"
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
                                'Shown next to the option at checkout',
                            )}
                            className="mt-1"
                        />
                        <InputError message={form.errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="instructions">
                            {t('Instructions')}
                        </Label>
                        <Textarea
                            id="instructions"
                            name="instructions"
                            value={form.data.instructions}
                            onChange={(e) =>
                                form.setData('instructions', e.target.value)
                            }
                            rows={4}
                            placeholder={t(
                                'Step-by-step payment instructions shown to customers',
                            )}
                            className="mt-1"
                        />
                        <InputError message={form.errors.instructions} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="grid gap-4 pt-6">
                    <div className="grid gap-2">
                        <Label htmlFor="sort_order">{t('Sort order')}</Label>
                        <Input
                            id="sort_order"
                            name="sort_order"
                            type="number"
                            step="1"
                            min="0"
                            value={form.data.sort_order}
                            onChange={(e) =>
                                form.setData('sort_order', e.target.value)
                            }
                            placeholder="0"
                            className="mt-1"
                        />
                        <InputError message={form.errors.sort_order} />
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
                            {t(
                                'Customers can pay with this method at checkout',
                            )}
                        </Label>
                    </div>
                    <InputError message={form.errors.is_active} />
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
