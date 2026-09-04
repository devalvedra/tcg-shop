import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { t } from '@/lib/i18n';
import { login } from '@/routes';
import { store } from '@/routes/admin/login';

export default function AdminLogin() {
    return (
        <>
            <Head title={t('Admin login')} />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="username">
                                    {t('Username')}
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder={t('admin')}
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t('Password')}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder={t('Password')}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">
                                    {t('Remember me')}
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full shadow-lg shadow-primary/25"
                                tabIndex={4}
                                disabled={processing}
                                data-test="admin-login-button"
                            >
                                {processing && <Spinner />}
                                {t('Log in')}
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <div className="space-x-1 text-center text-sm text-muted-foreground">
                <span>{t('Or, return to')}</span>
                <TextLink href={login()}>{t('customer log in')}</TextLink>
            </div>
        </>
    );
}

AdminLogin.layout = {
    title: t('Admin access'),
    description: t(
        'Enter your administrator username and password below to log in',
    ),
};
