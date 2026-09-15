import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Package, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import {
    edit as editProduct,
    index as productsIndex,
} from '@/routes/admin/products';
import { show as showStoreProduct } from '@/routes/products';
import type { Product, ProductImage, ProductStatus } from '@/types';

type Props = {
    product: Product;
    categories: Record<string, string>;
    statuses: Record<string, string>;
};

const statusStyles: Record<ProductStatus, string> = {
    ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'pre-order': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    unavailable: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString() : null;

export default function ShowProduct({ product, categories, statuses }: Props) {
    const images = product.images.filter((image) => image.url);
    const isPreOrder = product.status === 'pre-order';

    const [selected, setSelected] = useState(0);
    const [activeImage, setActiveImage] = useState<ProductImage | null>(null);

    return (
        <>
            <Head title={product.name} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={productsIndex()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to products')}
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                                <Package className="size-6" />
                                {product.name}
                            </h1>
                            <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[product.status]}`}
                            >
                                {t(statuses[product.status] ?? product.status)}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Added')}{' '}
                            {new Date(product.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline">
                            <a
                                href={showStoreProduct.url({
                                    product: product.slug,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="size-4" />
                                {t("Go to store's product")}
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={editProduct({ product: product.id })}>
                                <Pencil className="size-4" />
                                {t('Edit')}
                            </Link>
                        </Button>
                        <Form
                            {...ProductController.destroy.form({
                                product: product.id,
                            })}
                            onSubmit={(e) => {
                                if (
                                    !window.confirm(
                                        t(
                                            'Delete {name}? This cannot be undone.',
                                            {
                                                name: product.name,
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
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('Image')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {images.length > 0 ? (
                                <div className="grid gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveImage(
                                                images[selected] ?? images[0],
                                            )
                                        }
                                        className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/50 dark:to-violet-950/50"
                                    >
                                        <img
                                            src={
                                                images[selected]?.url ??
                                                images[0].url ??
                                                ''
                                            }
                                            alt={product.name}
                                            className="size-full object-cover"
                                        />
                                    </button>
                                    {images.length > 1 && (
                                        <div className="flex flex-wrap gap-2">
                                            {images.map((image, index) => (
                                                <button
                                                    key={image.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelected(index)
                                                    }
                                                    className={`size-14 overflow-hidden rounded-lg border transition ${
                                                        index === selected
                                                            ? 'ring-2 ring-indigo-500'
                                                            : 'opacity-70 hover:opacity-100'
                                                    }`}
                                                >
                                                    <img
                                                        src={image.url ?? ''}
                                                        alt={product.name}
                                                        className="size-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex aspect-square items-center justify-center rounded-xl border bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                                    <Package className="size-12" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {t('Details')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Category')}
                                    </p>
                                    <p className="font-medium">
                                        {categories[product.category] ??
                                            product.category}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Status')}
                                    </p>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[product.status]}`}
                                    >
                                        {t(
                                            statuses[product.status] ??
                                                product.status,
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Price')}
                                    </p>
                                    <p className="font-medium">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Sale price')}
                                    </p>
                                    <p className="font-medium">
                                        {product.sell_price
                                            ? formatCurrency(product.sell_price)
                                            : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Down payment')}
                                    </p>
                                    <p className="font-medium">
                                        {Number(product.down_payment) > 0
                                            ? formatCurrency(
                                                  product.down_payment,
                                              )
                                            : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Stock')}
                                    </p>
                                    <p
                                        className={`font-medium ${
                                            product.stock === 0
                                                ? 'text-rose-600'
                                                : ''
                                        }`}
                                    >
                                        {product.stock}
                                    </p>
                                </div>
                                {isPreOrder && (
                                    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                                        <div>
                                            <p className="text-muted-foreground">
                                                {t('Pre-order opens')}
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(
                                                    product.open_po_date,
                                                ) ?? '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">
                                                {t('Pre-order closes')}
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(
                                                    product.close_po_date,
                                                ) ?? '—'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p className="text-muted-foreground">
                                        {t('Last updated')}
                                    </p>
                                    <p className="font-medium">
                                        {new Date(
                                            product.updated_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-muted-foreground">
                                        {t('YouTube link')}
                                    </p>
                                    {product.youtube_link ? (
                                        <a
                                            href={product.youtube_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium break-all text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            {product.youtube_link}
                                        </a>
                                    ) : (
                                        <p className="font-medium">—</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {t('Description')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {product.description ??
                                        t('No description.')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog
                open={activeImage !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActiveImage(null);
                    }
                }}
            >
                <DialogContent className="max-w-3xl">
                    <DialogTitle className="sr-only">
                        {product.name}
                    </DialogTitle>
                    {activeImage && (
                        <img
                            src={activeImage.url ?? ''}
                            alt={product.name}
                            className="max-h-[75vh] w-full rounded-lg object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

ShowProduct.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: productsIndex(),
        },
        {
            title: 'Product Details',
            href: productsIndex(),
        },
    ],
};
