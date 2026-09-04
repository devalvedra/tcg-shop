import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import BannerController from '@/actions/App/Http/Controllers/Admin/BannerController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import {
    edit as editBanner,
    index as bannersIndex,
} from '@/routes/admin/banners';
import type { Banner } from '@/types';

type Props = {
    banner: Banner;
};

export default function ShowBanner({ banner }: Props) {
    return (
        <>
            <Head title={banner.title} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
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

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {banner.title}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Added {date}', {
                                date: new Date(
                                    banner.created_at,
                                ).toLocaleDateString(),
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={editBanner({ banner: banner.id })}>
                                <Pencil className="size-4" />
                                {t('Edit')}
                            </Link>
                        </Button>
                        <Form
                            {...BannerController.destroy.form({
                                banner: banner.id,
                            })}
                            onSubmit={(e) => {
                                if (
                                    !window.confirm(
                                        t(
                                            'Delete {name}? This cannot be undone.',
                                            {
                                                name: banner.title,
                                            },
                                        ),
                                    )
                                ) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <Button
                                type="submit"
                                variant="outline"
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                                <Trash2 className="size-4" />
                                {t('Delete')}
                            </Button>
                        </Form>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('Preview')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {banner.url ? (
                                <div className="overflow-hidden rounded-xl border">
                                    <img
                                        src={banner.url}
                                        alt={banner.title}
                                        className="aspect-[16/6] w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex aspect-[16/6] items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                                    <ImageIcon className="size-10" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {t('Details')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Subtitle')}
                                    </p>
                                    <p className="font-medium">
                                        {banner.subtitle ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Link')}
                                    </p>
                                    <p className="font-medium break-all">
                                        {banner.link_url ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Sort order')}
                                    </p>
                                    <p className="font-medium">
                                        {banner.sort_order}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Status')}
                                    </p>
                                    <p>
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                banner.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                    : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                                            }`}
                                        >
                                            {banner.is_active
                                                ? t('Active')
                                                : t('Inactive')}
                                        </span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

ShowBanner.layout = {
    breadcrumbs: [
        {
            title: 'Banners',
            href: bannersIndex(),
        },
        {
            title: 'Banner Details',
            href: bannersIndex(),
        },
    ],
};
