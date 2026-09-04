import { Form, Head, Link } from '@inertiajs/react';
import { Eye, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import { SortableTh } from '@/components/sortable-th';
import type { SortDirection } from '@/components/sortable-th';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import {
    create as createProduct,
    edit as editProduct,
    index as productsIndex,
    show as showProduct,
} from '@/routes/admin/products';
import type { PaginatedData, Product, ProductStatus } from '@/types';

type Props = {
    products: PaginatedData<Product>;
    filters: {
        search?: string;
        status?: string;
        category?: string;
        sort?: string;
        direction?: SortDirection;
    };
    categories: Record<string, string>;
    statuses: Record<string, string>;
};

const statusStyles: Record<ProductStatus, string> = {
    ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'pre-order': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    unavailable: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const nativeSelectClasses =
    'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

const formatPoWindow = (product: Product) => {
    if (!product.open_po_date && !product.close_po_date) {
        return null;
    }

    const open = product.open_po_date
        ? new Date(product.open_po_date).toLocaleDateString()
        : null;
    const close = product.close_po_date
        ? new Date(product.close_po_date).toLocaleDateString()
        : null;

    return [open, close].filter(Boolean).join(' → ');
};

export default function ProductsIndex({
    products,
    filters,
    categories,
    statuses,
}: Props) {
    const direction: SortDirection =
        filters.direction === 'desc' ? 'desc' : 'asc';

    const sortQuery = {
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.sort ? { sort: filters.sort } : {}),
        ...(filters.sort && filters.direction
            ? { direction: filters.direction }
            : {}),
    };

    const sortHref = (sortKey: string, sortDirection: SortDirection) =>
        productsIndex.url({
            query: { ...sortQuery, sort: sortKey, direction: sortDirection },
        });

    return (
        <>
            <Head title={t('Products')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Products')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'Manage your card catalog, pricing, and stock levels',
                            )}
                        </p>
                    </div>
                    <Button asChild className="shadow-lg shadow-primary/25">
                        <Link href={createProduct()}>
                            <Plus className="size-4" />
                            {t('Add product')}
                        </Link>
                    </Button>
                </div>

                <Card className="gap-0 overflow-hidden py-0">
                    <CardContent className="p-0">
                        <div className="border-b p-4">
                            <Form
                                {...ProductController.index.form()}
                                className="flex flex-col gap-2 lg:flex-row lg:items-center"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        defaultValue={filters.search}
                                        className="pl-9"
                                        placeholder={t(
                                            'Search by product name...',
                                        )}
                                    />
                                </div>
                                <select
                                    name="status"
                                    defaultValue={filters.status}
                                    className={nativeSelectClasses}
                                >
                                    <option value="">
                                        {t('All statuses')}
                                    </option>
                                    {Object.entries(statuses).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {t(label)}
                                            </option>
                                        ),
                                    )}
                                </select>
                                <select
                                    name="category"
                                    defaultValue={filters.category}
                                    className={nativeSelectClasses}
                                >
                                    <option value="">
                                        {t('All categories')}
                                    </option>
                                    {Object.entries(categories).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>
                                {filters.sort && (
                                    <input
                                        type="hidden"
                                        name="sort"
                                        value={filters.sort}
                                    />
                                )}
                                {filters.direction && (
                                    <input
                                        type="hidden"
                                        name="direction"
                                        value={filters.direction}
                                    />
                                )}
                                <Button type="submit" variant="outline">
                                    {t('Search')}
                                </Button>
                            </Form>
                        </div>

                        {products.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <SortableTh
                                                label={t('Product')}
                                                sortKey="name"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                            />
                                            <SortableTh
                                                label={t('Category')}
                                                sortKey="category"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden md:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Price')}
                                                sortKey="price"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden lg:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Stock')}
                                                sortKey="stock"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden lg:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Status')}
                                                sortKey="status"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden md:table-cell"
                                            />
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {products.data.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {product.images[0]
                                                            ?.url ? (
                                                            <img
                                                                src={
                                                                    product
                                                                        .images[0]
                                                                        .url
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="size-9 shrink-0 rounded-lg border object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                                                                <Package className="size-4" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">
                                                                {product.name}
                                                            </p>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {formatPoWindow(
                                                                    product,
                                                                ) ??
                                                                    t(
                                                                        'No pre-order window',
                                                                    )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                    {categories[
                                                        product.category
                                                    ] ?? product.category}
                                                </td>
                                                <td className="hidden px-4 py-3 lg:table-cell">
                                                    {product.sell_price
                                                        ? formatCurrency(
                                                              product.sell_price,
                                                          )
                                                        : formatCurrency(
                                                              product.price,
                                                          )}
                                                </td>
                                                <td className="hidden px-4 py-3 lg:table-cell">
                                                    <span
                                                        className={
                                                            product.stock === 0
                                                                ? 'text-rose-600'
                                                                : undefined
                                                        }
                                                    >
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="hidden px-4 py-3 md:table-cell">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[product.status]}`}
                                                    >
                                                        {statuses[
                                                            product.status
                                                        ] ?? product.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <Link
                                                                href={showProduct(
                                                                    {
                                                                        product:
                                                                            product.id,
                                                                    },
                                                                )}
                                                            >
                                                                <Eye className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'View {name}',
                                                                        {
                                                                            name: product.name,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <Link
                                                                href={editProduct(
                                                                    {
                                                                        product:
                                                                            product.id,
                                                                    },
                                                                )}
                                                            >
                                                                <Pencil className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'Edit {name}',
                                                                        {
                                                                            name: product.name,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                        <Form
                                                            {...ProductController.destroy.form(
                                                                {
                                                                    product:
                                                                        product.id,
                                                                },
                                                            )}
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
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                                            >
                                                                <Trash2 className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'Delete {name}',
                                                                        {
                                                                            name: product.name,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </Button>
                                                        </Form>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                                    <Package className="size-7" />
                                </div>
                                <h2 className="text-lg font-semibold">
                                    {t('No products found')}
                                </h2>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    {filters.search ||
                                    filters.status ||
                                    filters.category
                                        ? t(
                                              'Try a different search term.',
                                          )
                                        : t(
                                              'Add your first product to start building your catalog.',
                                          )}
                                </p>
                                {!filters.search &&
                                    !filters.status &&
                                    !filters.category && (
                                        <Button asChild className="mt-2">
                                            <Link href={createProduct()}>
                                                <Plus className="size-4" />
                                                {t('Add product')}
                                            </Link>
                                        </Button>
                                    )}
                            </div>
                        )}

                        {products.last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
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
                                                    href={productsIndex.url({
                                                        query: {
                                                            page,
                                                            ...sortQuery,
                                                        },
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
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: productsIndex(),
        },
    ],
};
