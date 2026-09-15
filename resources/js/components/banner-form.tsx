import { Link, useForm } from '@inertiajs/react';
import { ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import {
    index as bannersIndex,
    show as showBanner,
    store,
    update,
} from '@/routes/admin/banners';
import type { Banner } from '@/types';

type Props = {
    banner?: Banner;
};

type BannerFormData = {
    title: string;
    subtitle: string;
    link_url: string;
    sort_order: string;
    is_active: boolean;
    image: File | null;
};

export function BannerForm({ banner }: Props) {
    const isEdit = Boolean(banner);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const form = useForm<BannerFormData>({
        title: banner?.title ?? '',
        subtitle: banner?.subtitle ?? '',
        link_url: banner?.link_url ?? '',
        sort_order: banner?.sort_order?.toString() ?? '0',
        is_active: banner?.is_active ?? true,
        image: null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            form.put(update.url({ banner: banner!.id }), {
                forceFormData: true,
            });
        } else {
            form.post(store.url(), { forceFormData: true });
        }
    };

    const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        form.setData('image', file);

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const clearImage = () => {
        form.setData('image', null);
        setPreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const currentImage = preview ?? banner?.url ?? null;

    return (
        <form onSubmit={submit} className="grid gap-6">
            <Card>
                <CardContent className="grid gap-4 pt-6">
                    <div className="grid gap-2">
                        <Label htmlFor="title">
                            {t('Title')}{' '}
                            <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            placeholder="New sets weekly"
                            autoFocus
                            required
                            className="mt-1"
                        />
                        <InputError message={form.errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="subtitle">{t('Subtitle')}</Label>
                        <Input
                            id="subtitle"
                            name="subtitle"
                            value={form.data.subtitle}
                            onChange={(e) =>
                                form.setData('subtitle', e.target.value)
                            }
                            placeholder={t(
                                'A short line shown under the title',
                            )}
                            className="mt-1"
                        />
                        <InputError message={form.errors.subtitle} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="link_url">
                                {t('Link destination')}
                            </Label>
                            <Input
                                id="link_url"
                                name="link_url"
                                value={form.data.link_url}
                                onChange={(e) =>
                                    form.setData('link_url', e.target.value)
                                }
                                placeholder="/catalog?category=singles"
                                className="mt-1"
                            />
                            <InputError message={form.errors.link_url} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sort_order">
                                {t('Sort order')}{' '}
                                <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="sort_order"
                                name="sort_order"
                                type="number"
                                step="1"
                                min="0"
                                value={form.data.sort_order}
                                onChange={(e) =>
                                    form.setData('sort_order', e.target.value)
                                }
                                placeholder="0"
                                required
                                className="mt-1"
                            />
                            <InputError message={form.errors.sort_order} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            name="is_active"
                            checked={form.data.is_active}
                            onCheckedChange={(checked) =>
                                form.setData('is_active', checked === true)
                            }
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            {t('Show this banner on the store front page')}
                        </Label>
                    </div>
                    <InputError message={form.errors.is_active} />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="grid gap-4 pt-6">
                    <div>
                        <Label>{t('Banner image')}</Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'Optional. Use a wide landscape image (e.g. 1920x600) for the best result. Leave empty to show a branded gradient instead.',
                            )}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t(
                                'Accepted formats: JPEG, PNG, WebP, GIF. Maximum size: {size}.',
                                { size: '2 MB' },
                            )}
                        </p>
                    </div>

                    {currentImage && (
                        <div className="relative overflow-hidden rounded-lg border">
                            <img
                                src={currentImage}
                                alt={form.data.title || t('Banner preview')}
                                className="aspect-[21/7] w-full object-cover"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 size-7 rounded-full bg-background/80 text-rose-600 hover:bg-background hover:text-rose-700"
                                onClick={clearImage}
                            >
                                <X className="size-3.5" />
                                <span className="sr-only">
                                    {t('Remove image')}
                                </span>
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <Button asChild variant="outline">
                            <label className="cursor-pointer">
                                <ImagePlus className="size-4" />
                                {currentImage
                                    ? t('Replace image')
                                    : t('Choose image')}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={onImageChange}
                                    className="hidden"
                                />
                            </label>
                        </Button>
                    </div>
                    <InputError message={form.errors.image} />
                </CardContent>
            </Card>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={form.processing}>
                    {isEdit ? t('Update banner') : t('Create banner')}
                </Button>
                <Button asChild variant="ghost">
                    <Link
                        href={
                            isEdit
                                ? showBanner({ banner: banner!.id })
                                : bannersIndex()
                        }
                    >
                        {t('Cancel')}
                    </Link>
                </Button>
            </div>
        </form>
    );
}
