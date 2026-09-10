import { Head, Link } from '@inertiajs/react';
import { Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import { login } from '@/routes';

export default function PendingVerification() {
    return (
        <>
            <Head title={t('Registration pending')} />

            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                    <Clock3 className="size-9" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(
                        'Registration successful. Waiting for the administrator to verify your account. You will be able to log in once it is approved.',
                    )}
                </p>
                <Button asChild className="mt-2">
                    <Link href={login()}>{t('Go to login')}</Link>
                </Button>
            </div>
        </>
    );
}

PendingVerification.layout = {
    title: t('Registration successful'),
    description: t(
        'Your account is waiting for administrator verification',
    ),
};
