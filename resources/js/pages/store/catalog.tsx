import { Head, Link, router } from '@inertiajs/react';
import { Package, Search } from 'lucide-react';
import { SearchableSelect } from '@/components/searchable-select';
import { ProductCard } from '@/components/store/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import { catalog } from '@/routes';
import { show as showProduct } from '@/routes/products';
import type { PaginatedData, Product } from '@/types';

type Props = {
    products: PaginatedData<Product>;
    filters: {
        category?: string;
        search?: string;
        sort?: string;
        status?: string;
    };
    categories: Record<string, string>;
};

const nativeSelectClasses =
    'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

const withFilters = (filters: Props['filters'], extra: object = {}) =>
    catalog.url({
        query: {
            ...(filters.category ? { category: filters.category } : {}),
            ...(filters.search ? { search: filters.search } : {}),
            ...(filters.sort && filters.sort !== 'newest'
                ? { sort: filters.sort }
                : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...extra,
        },
    });

const hasFilters = (filters: Props['filters']) =>
    Boolean(filters.search || filters.category || filters.status);

export default function Catalog({ products, filters, categories }: Props) {
    const categoryOptions = [
        { value: '', label: t('All categories') },
        ...Object.entries(categories).map(([value, label]) => ({
            value,
            label,
        })),
    ];

    const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const term = String(formData.get('search') ?? '').trim();

        router.get(
            withFilters({ ...filters, search: term }),
            undefined,
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={t('Catalog')} />

            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-6">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {t('Catalog')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('Browse singles, booster boxes, packs, and more')}
                    </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <form
                            onSubmit={submitSearch}
                            className="relative"
                            role="search"
                        >
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                name="search"
                                key={filters.search}
                                defaultValue={filters.search ?? ''}
                                className="h-9 w-44 pl-9 md:w-56"
                                placeholder={t('Search products...')}
                                aria-label={t('Search products...')}
                            />
                        </form>
                        <SearchableSelect
                            value={filters.category ?? ''}
                            onChange={(category) => {
                                router.get(
                                    withFilters({
                                        ...filters,
                                        category,
                                    }),
                                    undefined,
                                    { preserveScroll: true },
                                );
                            }}
                            options={categoryOptions}
                            placeholder={t('All categories')}
                            ariaLabel={t('All categories')}
                            className="w-48 md:w-56"
                        />
                        <select
                            value={filters.status ?? ''}
                            onChange={(e) => {
                                router.get(
                                    withFilters({
                                        ...filters,
                                        status: e.target.value,
                                    }),
                                    undefined,
                                    { preserveScroll: true },
                                );
                            }}
                            className={nativeSelectClasses}
                            aria-label={t('Status')}
                        >
                            <option value="">{t('All statuses')}</option>
                            <option value="ready">{t('Ready')}</option>
                            <option value="pre-order">{t('Pre-order')}</option>
                        </select>
                        <select
                            value={filters.sort ?? 'newest'}
                            onChange={(e) => {
                                router.get(
                                    withFilters({
                                        ...filters,
                                        sort: e.target.value,
                                    }),
                                    undefined,
                                    { preserveScroll: true },
                                );
                            }}
                            className={nativeSelectClasses}
                            aria-label={t('Sort')}
                        >
                            <option value="newest">{t('Newest')}</option>
                            <option value="price-asc">
                                {t('Price: Low to High')}
                            </option>
                            <option value="price-desc">
                                {t('Price: High to Low')}
                            </option>
                        </select>
                    </div>
                    {hasFilters(filters) && (
                        <Button asChild variant="ghost">
                            <Link href={catalog()}>{t('Clear')}</Link>
                        </Button>
                    )}
                </div>

                {products.data.length > 0 ? (
                    <>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.data.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    href={showProduct({
                                        product: product.slug,
                                    })}
                                />
                            ))}
                        </div>

                        {products.last_page > 1 && (
                            <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
                                <p className="text-sm text-muted-foreground">
                                    {t('Showing {from} to {to} of {total}', {
                                        from: products.from as number,
                                        to: products.to as number,
                                        total: products.total,
                                    })}
                                </p>
                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: products.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => {
                                        const isActive =
                                            page === products.current_page;

                                        return (
                                            <Button
                                                key={page}
                                                asChild
                                                variant={
                                                    isActive
                                                        ? 'default'
                                                        : 'ghost'
                                                }
                                                size="sm"
                                                className="size-8 px-0"
                                            >
                                                <Link
                                                    href={withFilters(filters, {
                                                        page,
                                                    })}
                                                    preserveScroll
                                                >
                                                    {page}
                                                </Link>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-6 flex flex-col items-center gap-3 py-20 text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                            <Package className="size-7" />
                        </div>
                        <h2 className="text-lg font-semibold">
                            {t('No products found')}
                        </h2>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {hasFilters(filters)
                                ? t(
                                      'Try a different search term, or clear your filters.',
                                  )
                                : t(
                                      'New products are added regularly. Check back soon.',
                                  )}
                        </p>
                        {hasFilters(filters) && (
                            <Button asChild variant="outline" className="mt-2">
                                <Link href={catalog()}>
                                    {t('Clear filters')}
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
