import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Ticket } from 'lucide-react';
import { PromoCodeForm } from '@/components/promo-code-form';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
    create as createPromoCode,
    index as promoCodesIndex,
} from '@/routes/admin/promo-codes';

export default function CreatePromoCode() {
    return (
        <>
            <Head title={t('Add Promo Code')} />

            <div className="flex w-full max-w-none flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={promoCodesIndex()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to promo codes')}
                    </Link>
                </Button>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <Ticket className="size-6" />
                        {t('Add promo code')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                            'Create a discount code customers can use at checkout.',
                        )}
                    </p>
                </div>

                <PromoCodeForm />
            </div>
        </>
    );
}

CreatePromoCode.layout = {
    breadcrumbs: [
        {
            title: 'Promo Codes',
            href: promoCodesIndex(),
        },
        {
            title: 'Add Promo Code',
            href: createPromoCode(),
        },
    ],
};
