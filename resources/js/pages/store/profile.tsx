import { Form, Head, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import AppearanceTabs from '@/components/appearance-tabs';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { AddressManager } from '@/components/store/address-manager';
import type { RegionOption } from '@/components/store/region-fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import { logout } from '@/routes';
import type { Address, Auth } from '@/types';

type Props = {
    auth: Auth;
    passwordRules: string;
    addresses: Address[];
    provinces: RegionOption[];
};

export default function StoreProfile({
    passwordRules,
    addresses,
    provinces,
}: Props) {
    const { auth } = usePage<Props>().props;
    const user = auth.user;

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const initials = user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

    return (
        <>
            <Head title={t('Profile')} />

            <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-6">
                <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-semibold text-white shadow-lg shadow-indigo-500/30">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-2xl font-semibold tracking-tight">
                            {user.name}
                        </h1>
                        <p className="truncate text-sm text-muted-foreground">
                            {user.email ?? t('No email on file')}
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-8">
                    <Card>
                        <CardContent className="flex flex-col gap-6 p-5 sm:p-6">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {t('Profile')}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {t('Update your name and email address')}
                                </p>
                            </div>

                            <Form
                                {...ProfileController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                className="grid gap-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">
                                                {t(
                                                    'Account Name (Facebook, Whatsapp, or Other Social Media)',
                                                )}
                                            </Label>
                                            <Input
                                                id="name"
                                                className="mt-1 block w-full"
                                                defaultValue={user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder={t('Full name')}
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">
                                                {t('Email address')}
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                className="mt-1 block w-full"
                                                defaultValue={user.email ?? ''}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder={t('Email address')}
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button
                                                disabled={processing}
                                                data-test="update-profile-button"
                                            >
                                                {t('Save changes')}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
                            <AddressManager
                                addresses={addresses}
                                provinces={provinces}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex flex-col gap-6 p-5 sm:p-6">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {t('Change password')}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'Ensure your account is using a long, random password to stay secure',
                                    )}
                                </p>
                            </div>

                            <Form
                                {...SecurityController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                resetOnError={[
                                    'password',
                                    'password_confirmation',
                                    'current_password',
                                ]}
                                resetOnSuccess
                                onError={(errors) => {
                                    if (errors.password) {
                                        passwordInput.current?.focus();
                                    }

                                    if (errors.current_password) {
                                        currentPasswordInput.current?.focus();
                                    }
                                }}
                                className="grid gap-6"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="current_password">
                                                {t('Current password')}
                                            </Label>
                                            <PasswordInput
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                name="current_password"
                                                className="mt-1 block w-full"
                                                autoComplete="current-password"
                                                placeholder={t(
                                                    'Current password',
                                                )}
                                            />
                                            <InputError
                                                message={
                                                    errors.current_password
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">
                                                {t('New password')}
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                className="mt-1 block w-full"
                                                autoComplete="new-password"
                                                placeholder={t('New password')}
                                                passwordrules={passwordRules}
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">
                                                {t('Confirm password')}
                                            </Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                className="mt-1 block w-full"
                                                autoComplete="new-password"
                                                placeholder={t(
                                                    'Confirm password',
                                                )}
                                                passwordrules={passwordRules}
                                            />
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button
                                                disabled={processing}
                                                data-test="update-password-button"
                                            >
                                                {t('Save')}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {t('Appearance')}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'Update the appearance settings for your account',
                                    )}
                                </p>
                            </div>
                            <AppearanceTabs />
                        </CardContent>
                    </Card>

                    <Form {...logout.form()} className="flex justify-end">
                        <Button
                            type="submit"
                            variant="outline"
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                            {t('Log out')}
                        </Button>
                    </Form>
                </div>
            </div>
        </>
    );
}
