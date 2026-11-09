import { Form, Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    KeyRound,
    MapPin,
    Pencil,
    Plus,
    Star,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import CustomerController from '@/actions/App/Http/Controllers/Admin/CustomerController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { RegionFields } from '@/components/store/region-fields';
import type { RegionOption } from '@/components/store/region-fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import {
    index as customersIndex,
    show as showCustomer,
} from '@/routes/admin/customers';
import {
    destroy as destroyAddress,
    setDefault as setDefaultAddress,
    store as storeAddress,
    update as updateAddress,
} from '@/routes/admin/customers/addresses';
import type { Address, User } from '@/types';

type Props = {
    customer: User;
    addresses: Address[];
    customerStatuses: Record<string, string>;
    passwordRules: string;
    provinces: RegionOption[];
};

type AddressFormData = {
    receiver_name: string;
    address: string;
    city: string;
    province: string;
    district: string;
    subdistrict: string;
    zip: string;
    is_default: boolean;
};

const customerStatusStyles: Record<string, string> = {
    verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

/**
 * Admin-facing shipping address management: list the customer's addresses,
 * add a new one, promote any address to default, and delete them.
 */
function CustomerAddresses({
    customer,
    addresses,
    provinces,
}: {
    customer: User;
    addresses: Address[];
    provinces: RegionOption[];
}) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Address | null>(null);

    const form = useForm<AddressFormData>({
        receiver_name: '',
        address: '',
        city: '',
        province: '',
        district: '',
        subdistrict: '',
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
            province: address.province ?? '',
            district: address.district ?? '',
            subdistrict: address.subdistrict ?? '',
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
            form.put(
                updateAddress.url({
                    customer: customer.id,
                    address: editing.id,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () => cancel(),
                },
            );
        } else {
            form.post(storeAddress.url({ customer: customer.id }), {
                preserveScroll: true,
                onSuccess: () => cancel(),
            });
        }
    };

    const makeDefault = (address: Address) => {
        if (address.is_default) {
            return;
        }

        router.patch(
            setDefaultAddress.url({
                customer: customer.id,
                address: address.id,
            }),
            {},
            { preserveScroll: true },
        );
    };

    const remove = (address: Address) => {
        if (window.confirm(t('Delete this address?'))) {
            router.delete(
                destroyAddress.url({
                    customer: customer.id,
                    address: address.id,
                }),
                { preserveScroll: true },
            );
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    {t('Add, remove, or choose the default delivery address.')}
                </p>
                {!formOpen && (
                    <Button variant="outline" size="sm" onClick={startAdd}>
                        <Plus className="size-4" />
                        {t('Add address')}
                    </Button>
                )}
            </div>

            {addresses.length === 0 && !formOpen && (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {t('No shipping addresses on file.')}
                </p>
            )}

            {formOpen && (
                <form
                    onSubmit={submit}
                    className="grid gap-4 rounded-xl border p-4"
                >
                    <p className="text-sm font-medium">
                        {editing ? t('Edit address') : t('New address')}
                    </p>
                    <div className="grid gap-2">
                        <Label htmlFor="receiver_name">
                            {t('Receiver name')}{' '}
                            <span className="text-rose-500">*</span>
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
                        <Label htmlFor="address">
                            {t('Street address')}{' '}
                            <span className="text-rose-500">*</span>
                        </Label>
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

                    <RegionFields
                        provinces={provinces}
                        value={{
                            province: form.data.province,
                            city: form.data.city,
                            district: form.data.district,
                            subdistrict: form.data.subdistrict,
                        }}
                        errors={form.errors}
                        onChange={(field, value) => form.setData(field, value)}
                    />

                    <div className="grid gap-2 sm:max-w-xs">
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
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => makeDefault(address)}
                                >
                                    <Star className="size-4" />
                                    {t('Set as default')}
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => startEdit(address)}
                            >
                                <Pencil className="size-4" />
                                {t('Edit')}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:text-rose-700"
                                onClick={() => remove(address)}
                            >
                                <Trash2 className="size-4" />
                                {t('Delete')}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function EditCustomer({
    customer,
    addresses,
    customerStatuses,
    passwordRules,
    provinces,
}: Props) {
    return (
        <>
            <Head title={t('Edit {name}', { name: customer.name })} />

            <div className="flex w-full max-w-none flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={showCustomer({ customer: customer.id })}>
                        <ArrowLeft className="size-4" />
                        {t('Back to customer')}
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserRound className="size-5" />
                            {t('Edit customer')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {t('Update the record for {name}.', {
                                name: customer.name,
                            })}
                        </p>
                        <span
                            className={`mt-2 inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${customerStatusStyles[customer.status ?? 'verified']}`}
                        >
                            {t(
                                customerStatuses[
                                    customer.status ?? 'verified'
                                ] ?? 'Verified',
                            )}
                        </span>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...CustomerController.update.form({
                                customer: customer.id,
                            })}
                            className="grid gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            {t('Name')}{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={customer.name}
                                            autoFocus
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            {t('Phone number')}{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            defaultValue={customer.phone}
                                            placeholder="0917 123 4567"
                                            required
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            {t('Email')}{' '}
                                            <span className="text-muted-foreground">
                                                {t('(optional)')}
                                            </span>
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={customer.email ?? ''}
                                            placeholder="jane@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {t('Save changes')}
                                        </Button>
                                        <Button asChild variant="ghost">
                                            <Link
                                                href={showCustomer({
                                                    customer: customer.id,
                                                })}
                                            >
                                                {t('Cancel')}
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyRound className="size-5" />
                            {t('Change password')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {t('Set a new password for {name}', {
                                name: customer.name,
                            })}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...CustomerController.updatePassword.form({
                                customer: customer.id,
                            })}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnSuccess={[
                                'password',
                                'password_confirmation',
                            ]}
                            className="grid max-w-lg gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            {t('New password')}{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            autoComplete="new-password"
                                            placeholder={t('New password')}
                                            passwordrules={passwordRules}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t('At least 4 characters.')}
                                        </p>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            {t('Confirm password')}{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            placeholder={t('Confirm password')}
                                            passwordrules={passwordRules}
                                            required
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            data-test="update-customer-password-button"
                                        >
                                            {t('Change password')}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="size-5" />
                            {t('Shipping addresses')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {t('Addresses saved by {name} on their account', {
                                name: customer.name,
                            })}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <CustomerAddresses
                            customer={customer}
                            addresses={addresses}
                            provinces={provinces}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EditCustomer.layout = {
    breadcrumbs: [
        {
            title: 'Customers',
            href: customersIndex(),
        },
        {
            title: 'Edit Customer',
            href: customersIndex(),
        },
    ],
};
