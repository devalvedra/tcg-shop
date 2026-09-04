import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { t } from '@/lib/i18n';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <>
            <Head title={t('Create an account')} />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('Name')}</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    placeholder={t('Full name')}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">
                                    {t('Phone number')}
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    required
                                    tabIndex={2}
                                    autoComplete="tel"
                                    placeholder={t('0917 123 4567')}
                                    inputMode="tel"
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
                                    type="email"
                                    name="email"
                                    tabIndex={3}
                                    autoComplete="email"
                                    placeholder={t('you@example.com')}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t('Password')}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    placeholder={t('Password')}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t('Confirm password')}
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    placeholder={t('Confirm password')}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full shadow-lg shadow-primary/25"
                                tabIndex={6}
                                disabled={processing}
                                data-test="register-button"
                            >
                                {processing && <Spinner />}
                                {t('Create account')}
                            </Button>
                        </div>
                        <div className="space-x-1 text-center text-sm text-muted-foreground">
                            <span>{t('Already have an account?')}</span>
                            <TextLink href={login()}>{t('Log in')}</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: t('Create your account'),
    description: t('Sign up to start collecting from our shop'),
};
