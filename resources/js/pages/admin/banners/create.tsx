import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { BannerForm } from '@/components/banner-form';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
    create as createBanner,
    index as bannersIndex,
} from '@/routes/admin/banners';

export default function CreateBanner() {
    return (
        <>
            <Head title={t('Add Banner')} />

            <div className="flex w-full max-w-none flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={bannersIndex()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to banners')}
                    </Link>
                </Button>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <ImagePlus className="size-6" />
                        {t('Add banner')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                            'Create a promotional banner to feature on the store front page.',
                        )}
                    </p>
                </div>

                <BannerForm />
            </div>
        </>
    );
}

CreateBanner.layout = {
    breadcrumbs: [
        {
            title: 'Banners',
            href: bannersIndex(),
        },
        {
            title: 'Add Banner',
            href: createBanner(),
        },
    ],
};
