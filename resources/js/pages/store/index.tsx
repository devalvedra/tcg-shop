import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Package, Sparkles, Tags } from 'lucide-react';
import { ProductCard, categoryIconMap } from '@/components/store/product-card';
import { StoreBannerCarousel } from '@/components/store-banner-carousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { catalog } from '@/routes';
import { show as showProduct } from '@/routes/products';
import type { Banner, Product } from '@/types';

type Category = {
    key: string;
    label: string;
    count: number;
};

type Props = {
    banners: Banner[];
    featuredProducts: Product[];
    preOrderProducts: Product[];
    categories: Category[];
};

export default function StoreIndex({
    banners,
    featuredProducts,
    preOrderProducts,
    categories,
}: Props) {
    return (
        <>
            <Head title={t('TCG Shop')} />

            <StoreBannerCarousel banners={banners} />

            <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {t('Shop by category')}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('Find exactly what you are looking for')}
                    </p>
                </div>
                {categories.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                            <Tags className="size-7" />
                        </div>
                        <h3 className="text-lg font-semibold">
                            {t('No categories yet')}
                        </h3>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {t(
                                'Product categories will appear here once they are added.',
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        {categories.map((category) => {
                            const Icon =
                                categoryIconMap[category.key] ?? Sparkles;

                            return (
                                <Link
                                    key={category.key}
                                    href={catalog.url({
                                        query: { category: category.key },
                                    })}
                                    className="block focus-visible:outline-none"
                                >
                                    <Card className="group gap-0 p-4">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
                                            <Icon className="size-5" />
                                        </div>
                                        <p className="mt-3 font-medium">
                                            {category.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {t(
                                                category.count === 1
                                                    ? '{count} product'
                                                    : '{count} products',
                                                { count: category.count },
                                            )}
                                        </p>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            <section
                id="featured"
                className="mx-auto w-full max-w-7xl px-4 pb-12 md:px-6 md:pb-16"
            >
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            {t('Featured products')}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Ready to ship from our latest arrivals')}
                        </p>
                    </div>
                    <Link
                        href={catalog.url()}
                        className="hidden items-center gap-1 text-sm font-medium text-indigo-600 hover:underline sm:inline-flex"
                    >
                        {t('View catalog')}
                        <ArrowRight className="size-4" />
                    </Link>
                </div>

                {featuredProducts.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                            <Package className="size-7" />
                        </div>
                        <h3 className="text-lg font-semibold">
                            {t('No featured products yet')}
                        </h3>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {t(
                                'New products are added regularly. Check back soon.',
                            )}
                        </p>
                        <Button asChild className="mt-2">
                            <Link href={catalog.url()}>
                                {t('Browse the catalog')}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {featuredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                href={showProduct({ product: product.slug })}
                            />
                        ))}
                    </div>
                )}
            </section>

            {preOrderProducts.length > 0 && (
                <section id="pre-orders" className="border-t bg-muted/30">
                    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16">
                        <div>
                            <Badge className="rounded-full bg-amber-500 text-white ring-0 hover:bg-amber-500">
                                <Sparkles className="size-3" />
                                {t('Pre-orders open')}
                            </Badge>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                                {t('Secure your pre-orders')}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'Reserve upcoming releases before they sell out',
                                )}
                            </p>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                            {preOrderProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    href={showProduct({
                                        product: product.slug,
                                    })}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
