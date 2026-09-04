import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { PaymentMethodForm } from '@/components/payment-method-form';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
    create as createPaymentMethod,
    index as paymentMethodsIndex,
} from '@/routes/admin/payment-methods';

export default function CreatePaymentMethod() {
    return (
        <>
            <Head title={t('Add Payment Method')} />

            <div className="flex w-full max-w-none flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={paymentMethodsIndex()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to payment methods')}
                    </Link>
                </Button>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <CreditCard className="size-6" />
                        {t('Add payment method')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                            'Create a payment option customers can choose at checkout.',
                        )}
                    </p>
                </div>

                <PaymentMethodForm />
            </div>
        </>
    );
}

CreatePaymentMethod.layout = {
    breadcrumbs: [
        {
            title: 'Payment Methods',
            href: paymentMethodsIndex(),
        },
        {
            title: 'Add Payment Method',
            href: createPaymentMethod(),
        },
    ],
};
