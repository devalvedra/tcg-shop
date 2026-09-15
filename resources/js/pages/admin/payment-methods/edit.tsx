import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { PaymentMethodForm } from '@/components/payment-method-form';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
    edit as editPaymentMethod,
    index as paymentMethodsIndex,
} from '@/routes/admin/payment-methods';
import type { PaymentMethodOption } from '@/types';

type Props = {
    paymentMethod: PaymentMethodOption;
};

export default function EditPaymentMethod({ paymentMethod }: Props) {
    return (
        <>
            <Head title={t('Edit {name}', { name: paymentMethod.name })} />

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
                        {t('Edit {name}', { name: paymentMethod.name })}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                            'Update the name, account details, or availability of this payment method.',
                        )}
                    </p>
                </div>

                <PaymentMethodForm paymentMethod={paymentMethod} />
            </div>
        </>
    );
}

EditPaymentMethod.layout = {
    breadcrumbs: [
        {
            title: 'Payment Methods',
            href: paymentMethodsIndex(),
        },
        {
            title: 'Edit Payment Method',
            href: editPaymentMethod({ payment_method: 1 }),
        },
    ],
};
