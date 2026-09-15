import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Star, UserRound } from 'lucide-react';
import CustomerController from '@/actions/App/Http/Controllers/Admin/CustomerController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import {
    index as customersIndex,
    show as showCustomer,
} from '@/routes/admin/customers';
import type { Address, User } from '@/types';

type Props = {
    customer: User;
    addresses: Address[];
    customerStatuses: Record<string, string>;
};

const customerStatusStyles: Record<string, string> = {
    verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

export default function EditCustomer({
    customer,
    addresses,
    customerStatuses,
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
                        {addresses.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        className="flex items-start gap-3 rounded-xl border p-4"
                                    >
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
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                {t('No shipping addresses on file.')}
                            </p>
                        )}
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
