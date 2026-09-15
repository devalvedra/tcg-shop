import { Link, useForm } from '@inertiajs/react';
import { ImagePlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { currencySymbol } from '@/lib/currency';
import { t } from '@/lib/i18n';
import {
    index as productsIndex,
    show as showProduct,
    store,
    update,
} from '@/routes/admin/products';
import type { Product, ProductStatus } from '@/types';

type Props = {
    product?: Product;
    categories: Record<string, string>;
    statuses: Record<string, string>;
    generalDescription?: string | null;
};

type ProductFormData = {
    name: string;
    description: string;
    youtube_link: string;
    category: string;
    price: string;
    sell_price: string;
    down_payment: string;
    stock: string;
    status: ProductStatus;
    open_po_date: string;
    close_po_date: string;
    images: File[];
    image_order: string[];
    delete_images: number[];
};

type GalleryItem =
    | { key: string; kind: 'existing'; id: number; preview: string }
    | { key: string; kind: 'new'; file: File; preview: string };

const inputClasses = 'mt-1';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const MAX_TOTAL_BYTES = 6 * 1024 * 1024;

export function ProductForm({
    product,
    categories,
    statuses,
    generalDescription,
}: Props) {
    const isEdit = Boolean(product);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [gallery, setGallery] = useState<GalleryItem[]>(() =>
        (product?.images ?? []).map((image) => ({
            key: `existing-${image.id}`,
            kind: 'existing' as const,
            id: image.id,
            preview: image.url ?? '',
        })),
    );
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(() =>
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('upload_error') === '1'
            ? t(
                  'The uploaded files are too large. Please reduce the total size and try again.',
              )
            : null,
    );

    const form = useForm<ProductFormData>({
        name: product?.name ?? '',
        description: product?.description ?? '',
        youtube_link: product?.youtube_link ?? '',
        category: product?.category ?? 'singles',
        price: product?.price ?? '',
        sell_price: product?.sell_price ?? '',
        down_payment: product?.down_payment ?? '0',
        stock: product?.stock?.toString() ?? '',
        status: product?.status ?? 'ready',
        open_po_date: product?.open_po_date ?? '',
        close_po_date: product?.close_po_date ?? '',
        images: [],
        image_order: [],
        delete_images: [],
    });

    const isPreOrder = form.data.status === 'pre-order';

    const existingIds = new Set(
        gallery
            .filter((item) => item.kind === 'existing')
            .map((item) => item.id),
    );
    const removedCount = (product?.images ?? []).filter(
        (image) => !existingIds.has(image.id),
    ).length;
    const newImages = gallery.filter(
        (item): item is Extract<GalleryItem, { kind: 'new' }> =>
            item.kind === 'new',
    );

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('upload_error') !== '1') {
            return;
        }

        params.delete('upload_error');
        const query = params.toString();

        window.history.replaceState(
            {},
            '',
            `${window.location.pathname}${query ? `?${query}` : ''}`,
        );
    }, []);

    const imageError = Object.entries(form.errors).find(([key]) =>
        key.startsWith('images'),
    )?.[1];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const newIndexByKey = new Map(
            newImages.map((item, index) => [item.key, index]),
        );

        const order = gallery.map((item) =>
            item.kind === 'existing'
                ? `id:${item.id}`
                : `new:${newIndexByKey.get(item.key) ?? 0}`,
        );

        const removed = (product?.images ?? [])
            .filter((image) => !existingIds.has(image.id))
            .map((image) => image.id);

        form.transform((data) => ({
            ...data,
            images: newImages.map((item) => item.file),
            image_order: order,
            delete_images: removed,
        }));

        if (isEdit) {
            form.put(update.url({ product: product!.id }), {
                forceFormData: true,
            });
        } else {
            form.post(store.url(), { forceFormData: true });
        }
    };

    const onImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (selected.length === 0) {
            return;
        }

        const tooLarge = selected.filter((file) => file.size > MAX_IMAGE_BYTES);

        if (tooLarge.length > 0) {
            setUploadError(
                t('Each image must be {size} or smaller.', { size: '2 MB' }),
            );

            return;
        }

        const currentTotal = newImages.reduce(
            (sum, item) => sum + item.file.size,
            0,
        );
        const total =
            currentTotal + selected.reduce((sum, file) => sum + file.size, 0);

        if (total > MAX_TOTAL_BYTES) {
            setUploadError(
                t('The total upload size must be {size} or smaller.', {
                    size: '6 MB',
                }),
            );

            return;
        }

        setUploadError(null);
        setGallery((current) => [
            ...current,
            ...selected.map((file) => ({
                key: `new-${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
                kind: 'new' as const,
                file,
                preview: URL.createObjectURL(file),
            })),
        ]);
    };

    const removeGalleryImage = (key: string) => {
        setGallery((current) => current.filter((item) => item.key !== key));
    };

    const reorderGallery = (from: number, to: number) => {
        if (from === to) {
            return;
        }

        setGallery((current) => {
            const next = [...current];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);

            return next;
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-6">
            <Card>
                <CardContent className="grid gap-4 pt-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            {t('Name')} <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            autoFocus
                            required
                            className={inputClasses}
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="category">
                                {t('Category')}{' '}
                                <span className="text-rose-500">*</span>
                            </Label>
                            <Select
                                value={form.data.category}
                                onValueChange={(value) =>
                                    form.setData('category', value)
                                }
                            >
                                <SelectTrigger
                                    id="category"
                                    className="mt-1 w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categories).map(
                                        ([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.category} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">
                                {t('Status')}{' '}
                                <span className="text-rose-500">*</span>
                            </Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(value) =>
                                    form.setData(
                                        'status',
                                        value as ProductStatus,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="status"
                                    className="mt-1 w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(statuses).map(
                                        ([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {t(label)}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.status} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">
                                {t('Price ({symbol})', {
                                    symbol: currencySymbol(),
                                })}{' '}
                                <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.price}
                                onChange={(e) =>
                                    form.setData('price', e.target.value)
                                }
                                required
                                className={inputClasses}
                            />
                            <InputError message={form.errors.price} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sell_price">
                                {t('Sale price ({symbol})', {
                                    symbol: currencySymbol(),
                                })}{' '}
                                <span className="text-muted-foreground">
                                    {t('(optional)')}
                                </span>
                            </Label>
                            <Input
                                id="sell_price"
                                name="sell_price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.sell_price}
                                onChange={(e) =>
                                    form.setData('sell_price', e.target.value)
                                }
                                className={inputClasses}
                            />
                            <InputError message={form.errors.sell_price} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="down_payment">
                                {t('Down payment ({symbol})', {
                                    symbol: currencySymbol(),
                                })}{' '}
                                <span className="text-muted-foreground">
                                    {t('(optional)')}
                                </span>
                            </Label>
                            <Input
                                id="down_payment"
                                name="down_payment"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.down_payment}
                                onChange={(e) =>
                                    form.setData('down_payment', e.target.value)
                                }
                                className={inputClasses}
                            />
                            <InputError message={form.errors.down_payment} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="stock">
                                {t('Stock')}{' '}
                                <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                step="1"
                                min="0"
                                value={form.data.stock}
                                onChange={(e) =>
                                    form.setData('stock', e.target.value)
                                }
                                required
                                className={inputClasses}
                            />
                            <InputError message={form.errors.stock} />
                        </div>
                    </div>

                    {isPreOrder && (
                        <div className="rounded-lg border border-dashed bg-muted/50 p-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="open_po_date">
                                        {t('Pre-order opens')}
                                    </Label>
                                    <Input
                                        id="open_po_date"
                                        name="open_po_date"
                                        type="date"
                                        value={form.data.open_po_date}
                                        onChange={(e) =>
                                            form.setData(
                                                'open_po_date',
                                                e.target.value,
                                            )
                                        }
                                        className={inputClasses}
                                    />
                                    <InputError
                                        message={form.errors.open_po_date}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="close_po_date">
                                        {t('Pre-order closes')}
                                    </Label>
                                    <Input
                                        id="close_po_date"
                                        name="close_po_date"
                                        type="date"
                                        value={form.data.close_po_date}
                                        onChange={(e) =>
                                            form.setData(
                                                'close_po_date',
                                                e.target.value,
                                            )
                                        }
                                        className={inputClasses}
                                    />
                                    <InputError
                                        message={form.errors.close_po_date}
                                    />
                                </div>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {t(
                                    'Pre-order status requires both an open and close date. The down payment is set in the field above.',
                                )}
                            </p>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="youtube_link">
                            {t('YouTube link')}{' '}
                            <span className="text-muted-foreground">
                                {t('(optional)')}
                            </span>
                        </Label>
                        <Input
                            id="youtube_link"
                            name="youtube_link"
                            type="url"
                            value={form.data.youtube_link}
                            onChange={(e) =>
                                form.setData('youtube_link', e.target.value)
                            }
                            className={inputClasses}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t(
                                'Shown as an embedded video on the product page.',
                            )}
                        </p>
                        <InputError message={form.errors.youtube_link} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="description">
                                {t('Description')}
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!generalDescription}
                                onClick={() =>
                                    form.setData(
                                        'description',
                                        generalDescription ?? '',
                                    )
                                }
                            >
                                {t('General Description')}
                            </Button>
                        </div>
                        <Textarea
                            id="description"
                            name="description"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            className="mt-1 min-h-28"
                        />
                        <InputError message={form.errors.description} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="grid gap-4 pt-6">
                    <div>
                        <Label>{t('Product images')}</Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'Upload one or more images. Drag them to change the display order.',
                            )}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t(
                                'Accepted formats: JPEG, PNG, WebP, GIF. Maximum size: {size}.',
                                { size: '2 MB' },
                            )}
                        </p>
                    </div>

                    {gallery.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                            {gallery.map((item, index) => (
                                <div
                                    key={item.key}
                                    draggable
                                    onDragStart={() => setDragIndex(index)}
                                    onDragOver={(event) =>
                                        event.preventDefault()
                                    }
                                    onDrop={() => {
                                        if (dragIndex !== null) {
                                            reorderGallery(dragIndex, index);
                                        }

                                        setDragIndex(null);
                                    }}
                                    onDragEnd={() => setDragIndex(null)}
                                    className={`group relative cursor-move overflow-hidden rounded-lg border ${
                                        dragIndex === index ? 'opacity-40' : ''
                                    }`}
                                >
                                    <img
                                        src={item.preview}
                                        alt={
                                            item.kind === 'existing'
                                                ? (product?.name ?? '')
                                                : t('New product image')
                                        }
                                        className="aspect-square w-full object-cover"
                                    />
                                    <span className="absolute bottom-0.5 left-0.5 rounded bg-background/80 px-1.5 text-[10px] font-medium">
                                        {index + 1}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-0.5 right-0.5 size-5 rounded-full bg-background/80 text-rose-600 hover:bg-background hover:text-rose-700"
                                        onClick={() =>
                                            removeGalleryImage(item.key)
                                        }
                                    >
                                        <X className="size-3" />
                                        <span className="sr-only">
                                            {t('Remove image')}
                                        </span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {removedCount > 0 && (
                        <p className="text-sm text-rose-600">
                            {removedCount}{' '}
                            {removedCount === 1 ? t('image') : t('images')}{' '}
                            {t('will be removed on save.')}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <Button asChild variant="outline">
                            <label className="cursor-pointer">
                                <ImagePlus className="size-4" />
                                {t('Choose images')}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    multiple
                                    onChange={onImagesChange}
                                    className="hidden"
                                />
                            </label>
                        </Button>
                    </div>
                    {uploadError && (
                        <p className="text-sm text-rose-600">{uploadError}</p>
                    )}
                    {imageError && <InputError message={imageError} />}
                </CardContent>
            </Card>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={form.processing}>
                    {isEdit ? t('Update product') : t('Create product')}
                </Button>
                <Button asChild variant="ghost">
                    <Link
                        href={
                            isEdit
                                ? showProduct({ product: product!.id })
                                : productsIndex()
                        }
                    >
                        {t('Cancel')}
                    </Link>
                </Button>
            </div>
        </form>
    );
}
