import { router, useForm } from '@inertiajs/react';
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import { destroy, setDefault, store, update } from '@/routes/addresses';
import type { Address } from '@/types';

type Props = {
    addresses: Address[];
};

type AddressFormData = {
    receiver_name: string;
    address: string;
    city: string;
    zip: string;
    is_default: boolean;
};

export function AddressManager({ addresses }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Address | null>(null);

    const form = useForm<AddressFormData>({
        receiver_name: '',
        address: '',
        city: '',
        zip: '',
        is_default: false,
    });

    const startAdd = () => {
        setEditing(null);
        setFormOpen(true);
        form.reset();
        form.clearErrors();
    };

    const startEdit = (address: Address) => {
        setEditing(address);
        setFormOpen(true);
        form.setData({
            receiver_name: address.receiver_name,
            address: address.address,
            city: address.city,
            zip: address.zip ?? '',
            is_default: address.is_default,
        });
        form.clearErrors();
    };

    const cancel = () => {
        setEditing(null);
        setFormOpen(false);
        form.reset();
        form.clearErrors();
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (editing) {
            form.put(update.url({ address: editing.id }), {
                preserveScroll: true,
            });
        } else {
            form.post(store.url(), { preserveScroll: true });
        }
    };

    const makeDefault = (address: Address) => {
        if (address.is_default) {
            return;
        }

        router.patch(
            setDefault.url({ address: address.id }),
            {},
            { preserveScroll: true },
        );
    };

    const remove = (address: Address) => {
        if (window.confirm(t('Delete this address?'))) {
            router.delete(destroy.url({ address: address.id }), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">
                        {t('Shipping addresses')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t('Manage where your orders are delivered')}
                    </p>
                </div>
                {!formOpen && (
                    <Button variant="outline" size="sm" onClick={startAdd}>
                        <Plus className="size-4" />
                        {t('Add address')}
                    </Button>
                )}
            </div>

            {addresses.length === 0 && !formOpen && (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {t('No shipping addresses yet. Add one to place an order.')}
                </p>
            )}

            {formOpen && (
                <form
                    onSubmit={submit}
                    className="grid gap-4 rounded-xl border p-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="receiver_name">
                            {t('Receiver name')}
                        </Label>
                        <Input
                            id="receiver_name"
                            value={form.data.receiver_name}
                            onChange={(e) =>
                                form.setData('receiver_name', e.target.value)
                            }
                            placeholder={t('Who will receive the package')}
                            required
                        />
                        <InputError message={form.errors.receiver_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">{t('Street address')}</Label>
                        <Input
                            id="address"
                            value={form.data.address}
                            onChange={(e) =>
                                form.setData('address', e.target.value)
                            }
                            placeholder={t('House number and street')}
                            required
                        />
                        <InputError message={form.errors.address} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="city">{t('City')}</Label>
                            <Input
                                id="city"
                                value={form.data.city}
                                onChange={(e) =>
                                    form.setData('city', e.target.value)
                                }
                                placeholder={t('City')}
                                required
                            />
                            <InputError message={form.errors.city} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="zip">{t('Postal code')}</Label>
                            <Input
                                id="zip"
                                value={form.data.zip}
                                onChange={(e) =>
                                    form.setData('zip', e.target.value)
                                }
                                placeholder={t('Postal code')}
                            />
                            <InputError message={form.errors.zip} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_default"
                            checked={form.data.is_default}
                            onCheckedChange={(checked) =>
                                form.setData('is_default', checked === true)
                            }
                        />
                        <Label htmlFor="is_default" className="font-normal">
                            {t('Set as default address')}
                        </Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button type="submit" disabled={form.processing}>
                            {editing ? t('Save changes') : t('Add address')}
                        </Button>
                        <Button type="button" variant="ghost" onClick={cancel}>
                            {t('Cancel')}
                        </Button>
                    </div>
                </form>
            )}

            <div className="flex flex-col gap-3">
                {addresses.map((address) => (
                    <div
                        key={address.id}
                        className="flex items-start justify-between gap-3 rounded-xl border p-4"
                    >
                        <div className="flex min-w-0 gap-3">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-indigo-600" />
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium">
                                        {address.receiver_name}
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

                        <div className="flex shrink-0 items-center gap-1">
                            {!address.is_default && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title={t('Set as default')}
                                    onClick={() => makeDefault(address)}
                                >
                                    <Star className="size-4" />
                                    <span className="sr-only">
                                        {t('Set as default')}
                                    </span>
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                title={t('Edit')}
                                onClick={() => startEdit(address)}
                            >
                                <Pencil className="size-4" />
                                <span className="sr-only">{t('Edit')}</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                title={t('Delete')}
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => remove(address)}
                            >
                                <Trash2 className="size-4" />
                                <span className="sr-only">{t('Delete')}</span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
