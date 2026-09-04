import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { BannerForm } from '@/components/banner-form';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
    index as bannersIndex,
    show as showBanner,
} from '@/routes/admin/banners';
import type { Banner } from '@/types';

type Props = {
    banner: Banner;
};

export default function EditBanner({ banner }: Props) {
    return (
        <>
            <Head title={t('Edit {name}', { name: banner.title })} />

            <div className="flex w-full max-w-none flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={showBanner({ banner: banner.id })}>
                        <ArrowLeft className="size-4" />
                        {t('Back to banner')}
                    </Link>
                </Button>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <Pencil className="size-6" />
                        {t('Edit banner')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('Update the details of this promotional banner.')}
                    </p>
                </div>

                <BannerForm banner={banner} />
            </div>
        </>
    );
}

EditBanner.layout = {
    breadcrumbs: [
        {
            title: 'Banners',
            href: bannersIndex(),
        },
        {
            title: 'Edit Banner',
            href: bannersIndex(),
        },
    ],
};
