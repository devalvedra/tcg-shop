import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Ticket } from 'lucide-react';
import { PromoCodeForm } from '@/components/promo-code-form';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
    edit as editPromoCode,
    index as promoCodesIndex,
} from '@/routes/admin/promo-codes';
import type { PromoCode } from '@/types';

type Props = {
    promoCode: PromoCode;
};

export default function EditPromoCode({ promoCode }: Props) {
    return (
        <>
            <Head title={t('Edit {name}', { name: promoCode.code })} />

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
                        {t('Edit {name}', { name: promoCode.code })}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                            'Update the discount, window, or limits for this code.',
                        )}
                    </p>
                </div>

                <PromoCodeForm promoCode={promoCode} />
            </div>
        </>
    );
}

EditPromoCode.layout = {
    breadcrumbs: [
        {
            title: 'Promo Codes',
            href: promoCodesIndex(),
        },
        {
            title: 'Edit Promo Code',
            href: editPromoCode({ promo_code: 1 }),
        },
    ],
};
