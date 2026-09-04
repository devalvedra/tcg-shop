import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, UserRoundPlus } from 'lucide-react';
import CustomerController from '@/actions/App/Http/Controllers/Admin/CustomerController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import {
    create as createCustomer,
    index as customersIndex,
} from '@/routes/admin/customers';

export default function CreateCustomer() {
    return (
        <>
            <Head title={t('Add Customer')} />

            <div className="flex w-full max-w-none flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={customersIndex()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to customers')}
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserRoundPlus className="size-5" />
                            {t('Add customer')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'The customer will use their phone number and password to log in. New accounts are created with the default password.',
                            )}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Form
                            {...CustomerController.store.form()}
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
                                            placeholder="Jane Smith"
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
                                            placeholder="jane@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="rounded-lg border border-dashed bg-muted/50 p-3 text-sm text-muted-foreground">
                                        {t(
                                            'The customer can sign in immediately with their phone number and the default password',
                                        )}{' '}
                                        <code className="rounded bg-muted px-1 py-0.5 text-foreground">
                                            password
                                        </code>
                                        .{' '}
                                        {t(
                                            'They can change it later in their account settings.',
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {t('Create customer')}
                                        </Button>
                                        <Button asChild variant="ghost">
                                            <Link href={customersIndex()}>
                                                {t('Cancel')}
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CreateCustomer.layout = {
    breadcrumbs: [
        {
            title: 'Customers',
            href: customersIndex(),
        },
        {
            title: 'Add Customer',
            href: createCustomer(),
        },
    ],
};
