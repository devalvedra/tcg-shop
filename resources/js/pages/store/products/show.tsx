import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    Check,
    ChevronLeft,
    ChevronRight,
    Minus,
    Package,
    Plus,
    ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import { categoryIconMap, ProductCard } from '@/components/store/product-card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import { catalog, login } from '@/routes';
import { store as cartStore } from '@/routes/cart';
import { show as showProduct } from '@/routes/products';
import type { Auth, Product } from '@/types';

type Props = {
    product: Product;
    recommended: Product[];
    youtubeEmbedUrl: string | null;
    cartQuantity: number;
    freeShippingThreshold: number;
};

const statusStyles: Record<Product['status'], string> = {
    ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'pre-order': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    unavailable: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString() : null;

function ProductVideo({ url, title }: { url: string; title: string }) {
    return (
        <div className="overflow-hidden rounded-2xl border">
            <div className="relative aspect-video w-full">
                <iframe
                    src={url}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 size-full"
                />
            </div>
        </div>
    );
}

export default function ShowProduct({
    product,
    recommended,
    youtubeEmbedUrl,
    cartQuantity,
    freeShippingThreshold,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAuthenticated = Boolean(auth?.user);

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const images = product.images.filter((image) => image.url);
    const mainImage = images[selectedImage]?.url;
    const Icon = categoryIconMap[product.category] ?? Package;

    const price = product.sell_price ?? product.price;

    const isPreOrder = product.status === 'pre-order';
    const hasDownPayment =
        product.down_payment !== null && Number(product.down_payment) > 0;
    const availableStock = Math.max(0, product.stock - cartQuantity);
    const outOfStock = availableStock === 0;
    const maxQuantity = Math.max(1, availableStock);

    const now = new Date();
    const openDate = product.open_po_date
        ? new Date(`${product.open_po_date}T00:00:00`)
        : null;
    const closeDate = product.close_po_date
        ? new Date(`${product.close_po_date}T23:59:59`)
        : null;
    const preOrderOpen = Boolean(
        isPreOrder &&
        openDate &&
        closeDate &&
        now >= openDate &&
        now <= closeDate,
    );

    const addToCartLabel = isPreOrder ? t('Pre-order') : t('Add to cart');

    const addToCart = () => {
        setAdding(true);
        router.post(
            cartStore.url({ product: product.id }),
            { quantity },
            { preserveScroll: true, onFinish: () => setAdding(false) },
        );
    };

    const slideImage = (direction: number) => {
        if (images.length < 2) {
            return;
        }

        setSelectedImage(
            (current) => (current + direction + images.length) % images.length,
        );
    };

    return (
        <>
            <Head title={product.name} />

            <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={catalog()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to catalog')}
                    </Link>
                </Button>

                <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div>
                        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/50 dark:to-violet-950/50">
                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                                    <Icon className="size-10" />
                                </div>
                            )}

                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => slideImage(-1)}
                                        aria-label={t('Previous image')}
                                        className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => slideImage(1)}
                                        aria-label={t('Next image')}
                                        className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
                                    >
                                        <ChevronRight className="size-4" />
                                    </button>
                                </>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="image-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
                                {images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() => setSelectedImage(index)}
                                        className={`size-16 shrink-0 overflow-hidden rounded-lg border transition ${
                                            index === selectedImage
                                                ? 'border-indigo-500'
                                                : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={image.url ?? undefined}
                                            alt={t('{name} view {index}', {
                                                name: product.name,
                                                index: index + 1,
                                            })}
                                            className="size-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                {product.category_name}
                            </span>
                            <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[product.status]}`}
                            >
                                {product.status === 'ready'
                                    ? t('In stock')
                                    : product.status === 'pre-order'
                                      ? t('Pre-order')
                                      : t('Unavailable')}
                            </span>
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight">
                            {product.name}
                        </h1>

                        {isAuthenticated && (
                            <div className="flex flex-col gap-1">
                                <span className="text-4xl font-bold tracking-tight tabular-nums">
                                    {formatCurrency(price)}
                                </span>
                                {isPreOrder && (
                                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                        {t('Pre-order')} —{' '}
                                        {t('pay a down payment to reserve')}
                                    </span>
                                )}
                            </div>
                        )}

                        {isPreOrder &&
                            (preOrderOpen ? (
                                <div className="rounded-lg border bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                    <div className="flex items-center gap-2">
                                        <CalendarClock className="size-4 shrink-0" />
                                        <span>
                                            <strong>
                                                {t('Pre-order opens:')}
                                            </strong>{' '}
                                            {formatDate(product.open_po_date)}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 pl-6">
                                        <span>
                                            <strong>
                                                {t('Pre-order closes:')}
                                            </strong>{' '}
                                            {formatDate(product.close_po_date)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 rounded-lg border bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                                    <CalendarClock className="size-4 shrink-0" />
                                    <span>
                                        {t(
                                            'This product is not available for pre-order yet.',
                                        )}
                                    </span>
                                </div>
                            ))}

                        <div className="flex items-center gap-2 text-sm">
                            {isPreOrder && !preOrderOpen ? (
                                <span className="text-muted-foreground">
                                    {t('{count} units available', {
                                        count: product.stock,
                                    })}
                                </span>
                            ) : outOfStock ? (
                                <span className="text-rose-600">
                                    {isPreOrder
                                        ? t('No units available for pre-order')
                                        : t('Currently out of stock')}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-emerald-600">
                                    <Check className="size-4" />
                                    {isPreOrder
                                        ? availableStock <= 5
                                            ? t(
                                                  'Only {count} left to pre-order',
                                                  {
                                                      count: availableStock,
                                                  },
                                              )
                                            : t(
                                                  '{count} available for pre-order',
                                                  {
                                                      count: availableStock,
                                                  },
                                              )
                                        : availableStock <= 5
                                          ? t('Only {count} left in stock', {
                                                count: availableStock,
                                            })
                                          : t('{count} in stock', {
                                                count: availableStock,
                                            })}
                                </span>
                            )}
                        </div>

                        {youtubeEmbedUrl && (
                            <div className="lg:hidden">
                                <ProductVideo
                                    url={youtubeEmbedUrl}
                                    title={product.name}
                                />
                            </div>
                        )}

                        {product.description && (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {product.description}
                            </p>
                        )}

                        <div className="flex flex-col gap-3 border-t pt-5">
                            {hasDownPayment && (
                                <div className="rounded-lg border bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                    <p className="font-medium">
                                        {t(
                                            'You have to pay down payment for this product',
                                        )}
                                    </p>
                                    <p className="mt-0.5">
                                        {formatCurrency(product.down_payment)}
                                    </p>
                                </div>
                            )}

                            {!isAuthenticated ? (
                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={login()}>
                                        {t('Log in to purchase')}
                                    </Link>
                                </Button>
                            ) : outOfStock || (isPreOrder && !preOrderOpen) ? (
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto"
                                    disabled
                                >
                                    <ShoppingCart className="size-4" />
                                    {isPreOrder
                                        ? t('Pre-order unavailable')
                                        : t('Out of stock')}
                                </Button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="size-9"
                                            onClick={() =>
                                                setQuantity((q) =>
                                                    Math.max(1, q - 1),
                                                )
                                            }
                                            aria-label={t('Decrease quantity')}
                                        >
                                            <Minus className="size-4" />
                                        </Button>
                                        <span className="w-10 text-center text-sm font-medium">
                                            {quantity}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="size-9"
                                            onClick={() =>
                                                setQuantity((q) =>
                                                    Math.min(
                                                        maxQuantity,
                                                        q + 1,
                                                    ),
                                                )
                                            }
                                            aria-label={t('Increase quantity')}
                                        >
                                            <Plus className="size-4" />
                                        </Button>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="flex-1 sm:flex-none"
                                        onClick={addToCart}
                                        disabled={adding}
                                    >
                                        <ShoppingCart className="size-4" />
                                        {addToCartLabel}
                                    </Button>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {isPreOrder
                                    ? preOrderOpen
                                        ? t(
                                              'Pre-order products are reserved when you place your order.',
                                          )
                                        : t(
                                              'This product is not available for pre-order yet.',
                                          )
                                    : outOfStock
                                      ? t(
                                            'This product is currently out of stock.',
                                        )
                                      : t(
                                            'Free shipping on orders over {amount}.',
                                            {
                                                amount: formatCurrency(
                                                    freeShippingThreshold,
                                                ),
                                            },
                                        )}
                            </p>
                        </div>
                    </div>
                </div>

                {youtubeEmbedUrl && (
                    <section className="mt-16 hidden border-t pt-10 lg:block">
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    {t('Product video')}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t('Watch a video about this product')}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <ProductVideo
                                url={youtubeEmbedUrl}
                                title={product.name}
                            />
                        </div>
                    </section>
                )}

                {recommended.length > 0 && (
                    <section className="mt-16 border-t pt-10">
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    {t('Recommended for you')}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t('More products from {category}', {
                                        category: product.category_name,
                                    })}
                                </p>
                            </div>
                            <Button asChild variant="ghost">
                                <Link
                                    href={catalog({
                                        query: { category: product.category },
                                    })}
                                    className="text-muted-foreground"
                                >
                                    {t('View all')}
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {recommended.map((recommendedProduct) => (
                                <ProductCard
                                    key={recommendedProduct.id}
                                    product={recommendedProduct}
                                    href={showProduct({
                                        product: recommendedProduct.slug,
                                    })}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
