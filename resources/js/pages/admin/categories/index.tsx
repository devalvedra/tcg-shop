import { Form, Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Tags, Trash2 } from 'lucide-react';
import ProductCategoryController from '@/actions/App/Http/Controllers/Admin/ProductCategoryController';
import { SortableTh } from '@/components/sortable-th';
import type { SortDirection } from '@/components/sortable-th';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import {
    create as createCategory,
    edit as editCategory,
    index as categoriesIndex,
    show as showCategory,
} from '@/routes/admin/categories';
import type { PaginatedData, ProductCategory } from '@/types';

type Props = {
    categories: PaginatedData<ProductCategory & { products_count: number }>;
    filters: {
        search?: string;
        sort?: string;
        direction?: SortDirection;
    };
};

export default function CategoriesIndex({ categories, filters }: Props) {
    const direction: SortDirection =
        filters.direction === 'desc' ? 'desc' : 'asc';

    const sortQuery = {
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.sort ? { sort: filters.sort } : {}),
        ...(filters.sort && filters.direction
            ? { direction: filters.direction }
            : {}),
    };

    const sortHref = (sortKey: string, sortDirection: SortDirection) =>
        categoriesIndex.url({
            query: { ...sortQuery, sort: sortKey, direction: sortDirection },
        });

    return (
        <>
            <Head title={t('Categories')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Categories')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Manage the categories shown in the catalog')}
                        </p>
                    </div>
                    <Button asChild className="shadow-lg shadow-primary/25">
                        <Link href={createCategory()}>
                            <Plus className="size-4" />
                            {t('Add category')}
                        </Link>
                    </Button>
                </div>

                <Card className="gap-0 overflow-hidden py-0">
                    <CardContent className="p-0">
                        <div className="border-b p-4">
                            <Form
                                {...ProductCategoryController.index.form()}
                                className="flex flex-col gap-2 lg:flex-row lg:items-center"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        defaultValue={filters.search}
                                        className="pl-9"
                                        placeholder={t(
                                            'Search by name or slug...',
                                        )}
                                    />
                                </div>
                                <Button type="submit" variant="outline">
                                    {t('Search')}
                                </Button>
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
                            </Form>
                        </div>

                        {categories.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <SortableTh
                                                label={t('Name')}
                                                sortKey="name"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                            />
                                            <SortableTh
                                                label={t('Slug')}
                                                sortKey="slug"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden md:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Products')}
                                                sortKey="products"
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
                                        {categories.data.map((category) => (
                                            <tr
                                                key={category.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="flex items-center gap-2 font-medium">
                                                        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                                                            <Tags className="size-4" />
                                                        </span>
                                                        {category.name}
                                                    </span>
                                                </td>
                                                <td className="hidden px-4 py-3 font-mono text-xs md:table-cell">
                                                    {category.slug}
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                    {category.products_count}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <Link
                                                                href={showCategory(
                                                                    {
                                                                        product_category:
                                                                            category.id,
                                                                    },
                                                                )}
                                                            >
                                                                <Eye className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'View {name}',
                                                                        {
                                                                            name: category.name,
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
                                                                href={editCategory(
                                                                    {
                                                                        product_category:
                                                                            category.id,
                                                                    },
                                                                )}
                                                            >
                                                                <Pencil className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'Edit {name}',
                                                                        {
                                                                            name: category.name,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                        <Form
                                                            {...ProductCategoryController.destroy.form(
                                                                {
                                                                    product_category:
                                                                        category.id,
                                                                },
                                                            )}
                                                            onSubmit={(e) => {
                                                                if (
                                                                    !window.confirm(
                                                                        t(
                                                                            'Delete {name}? Products using this category will keep their current value.',
                                                                            {
                                                                                name: category.name,
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
                                                                            name: category.name,
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
                                    <Tags className="size-7" />
                                </div>
                                <h2 className="text-lg font-semibold">
                                    {t('No categories found')}
                                </h2>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    {filters.search
                                        ? t('Try a different search term.')
                                        : t(
                                              'Add a category to start organizing your catalog.',
                                          )}
                                </p>
                                {!filters.search && (
                                    <Button asChild className="mt-2">
                                        <Link href={createCategory()}>
                                            <Plus className="size-4" />
                                            {t('Add category')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}

                        {categories.last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
                                <p className="text-sm text-muted-foreground">
                                    {t('Showing {from} to {to} of {total}', {
                                        from: categories.from as number,
                                        to: categories.to as number,
                                        total: categories.total,
                                    })}
                                </p>
                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: categories.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => {
                                        const isActive =
                                            page === categories.current_page;

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
                                                    href={categoriesIndex.url({
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

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: categoriesIndex(),
        },
    ],
};
