import { Link, useForm } from '@inertiajs/react';
import { ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
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
};

type ProductFormData = {
    name: string;
    description: string;
    category: string;
    price: string;
    sell_price: string;
    stock: string;
    status: ProductStatus;
    open_po_date: string;
    close_po_date: string;
    images: File[];
    delete_images: number[];
};

const inputClasses = 'mt-1';

export function ProductForm({ product, categories, statuses }: Props) {
    const isEdit = Boolean(product);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    const form = useForm<ProductFormData>({
        name: product?.name ?? '',
        description: product?.description ?? '',
        category: product?.category ?? 'singles',
        price: product?.price ?? '',
        sell_price: product?.sell_price ?? '',
        stock: product?.stock?.toString() ?? '',
        status: product?.status ?? 'ready',
        open_po_date: product?.open_po_date ?? '',
        close_po_date: product?.close_po_date ?? '',
        images: [],
        delete_images: [],
    });

    const isPreOrder = form.data.status === 'pre-order';

    const remainingImages = product?.images.filter(
        (image) => !form.data.delete_images.includes(image.id),
    );

    const imageError = Object.entries(form.errors).find(([key]) =>
        key.startsWith('images'),
    )?.[1];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            form.put(update.url({ product: product!.id }), {
                forceFormData: true,
            });
        } else {
            form.post(store.url(), { forceFormData: true });
        }
    };

    const onImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        form.setData('images', files);
        setNewPreviews(files.map((file) => URL.createObjectURL(file)));
    };

    const clearNewImages = () => {
        form.setData('images', []);
        setNewPreviews([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const toggleDeleteImage = (imageId: number) => {
        const current = form.data.delete_images;
        form.setData(
            'delete_images',
            current.includes(imageId)
                ? current.filter((id) => id !== imageId)
                : [...current, imageId],
        );
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
                            placeholder="Charizard EX"
                            autoFocus
                            required
                            className={inputClasses}
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">{t('Description')}</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            placeholder={t(
                                'Condition, set details, and anything else collectors should know.',
                            )}
                            className="mt-1 min-h-28"
                        />
                        <InputError message={form.errors.description} />
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
                                    <SelectValue
                                        placeholder={t('Select a category')}
                                    />
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
                                    <SelectValue
                                        placeholder={t('Select a status')}
                                    />
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

                    <div className="grid gap-4 sm:grid-cols-3">
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
                                placeholder="0.00"
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
                                placeholder="0.00"
                                className={inputClasses}
                            />
                            <InputError message={form.errors.sell_price} />
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
                                placeholder="0"
                                required
                                className={inputClasses}
                            />
                            <InputError message={form.errors.stock} />
                        </div>
                    </div>

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
                            {isPreOrder
                                ? t(
                                      'Pre-order status requires both an open and close date. Customers choose their own down payment amount at checkout.',
                                  )
                                : t(
                                      'Only needed when the product is listed as a pre-order.',
                                  )}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="grid gap-4 pt-6">
                    <div>
                        <Label>{t('Product images')}</Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'Upload one or more images. They are shown in the order they are added.',
                            )}
                        </p>
                    </div>

                    {remainingImages && remainingImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {remainingImages.map((image) => (
                                <div
                                    key={image.id}
                                    className="group relative overflow-hidden rounded-lg border"
                                >
                                    <img
                                        src={image.url ?? ''}
                                        alt={product!.name}
                                        className="aspect-square w-full object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 size-6 rounded-full bg-background/80 text-rose-600 hover:bg-background hover:text-rose-700"
                                        onClick={() =>
                                            toggleDeleteImage(image.id)
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

                    {product && form.data.delete_images.length > 0 && (
                        <p className="text-sm text-rose-600">
                            {form.data.delete_images.length}{' '}
                            {form.data.delete_images.length === 1
                                ? t('image')
                                : t('images')}{' '}
                            {t('will be removed on save.')}
                        </p>
                    )}

                    {newPreviews.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {newPreviews.map((preview, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-lg border"
                                >
                                    <img
                                        src={preview}
                                        alt={t('New product image')}
                                        className="aspect-square w-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <Button asChild variant="outline">
                            <label className="cursor-pointer">
                                <ImagePlus className="size-4" />
                                {t('Choose images')}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={onImagesChange}
                                    className="hidden"
                                />
                            </label>
                        </Button>
                        {newPreviews.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={clearNewImages}
                            >
                                {t('Clear new images')}
                            </Button>
                        )}
                    </div>
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
