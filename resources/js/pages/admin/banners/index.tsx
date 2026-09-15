import { Form, Head, Link } from '@inertiajs/react';
import {
    Eye,
    Image as ImageIcon,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import BannerController from '@/actions/App/Http/Controllers/Admin/BannerController';
import { SortableTh } from '@/components/sortable-th';
import type { SortDirection } from '@/components/sortable-th';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import {
    create as createBanner,
    edit as editBanner,
    index as bannersIndex,
    show as showBanner,
} from '@/routes/admin/banners';
import type { Banner, PaginatedData } from '@/types';

type Props = {
    banners: PaginatedData<Banner>;
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        direction?: SortDirection;
    };
};

const nativeSelectClasses =
    'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

export default function BannersIndex({ banners, filters }: Props) {
    const direction: SortDirection =
        filters.direction === 'desc' ? 'desc' : 'asc';

    const sortQuery = {
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.sort ? { sort: filters.sort } : {}),
        ...(filters.sort && filters.direction
            ? { direction: filters.direction }
            : {}),
    };

    const sortHref = (sortKey: string, sortDirection: SortDirection) =>
        bannersIndex.url({
            query: { ...sortQuery, sort: sortKey, direction: sortDirection },
        });

    return (
        <>
            <Head title={t('Banners')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Banners')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'Manage the promotional banners shown on the store front page',
                            )}
                        </p>
                    </div>
                    <Button asChild className="shadow-lg shadow-primary/25">
                        <Link href={createBanner()}>
                            <Plus className="size-4" />
                            {t('Add banner')}
                        </Link>
                    </Button>
                </div>

                <Card className="gap-0 overflow-hidden py-0">
                    <CardContent className="p-0">
                        <div className="border-b p-4">
                            <Form
                                {...BannerController.index.form()}
                                className="flex flex-col gap-2 lg:flex-row lg:items-center"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        defaultValue={filters.search}
                                        className="pl-9"
                                        placeholder={t('Search by title...')}
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
                                    <option value="active">
                                        {t('Active')}
                                    </option>
                                    <option value="inactive">
                                        {t('Inactive')}
                                    </option>
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

                        {banners.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <SortableTh
                                                label={t('Banner')}
                                                sortKey="title"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                            />
                                            <SortableTh
                                                label={t('Sort order')}
                                                sortKey="sort_order"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden md:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Link')}
                                                sortKey="link"
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
                                        {banners.data.map((banner) => (
                                            <tr
                                                key={banner.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {banner.url ? (
                                                            <img
                                                                src={banner.url}
                                                                alt={
                                                                    banner.title
                                                                }
                                                                className="h-12 w-24 shrink-0 rounded-lg border object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                                                                <ImageIcon className="size-5" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">
                                                                {banner.title}
                                                            </p>
                                                            {banner.subtitle && (
                                                                <p className="truncate text-xs text-muted-foreground">
                                                                    {
                                                                        banner.subtitle
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                    {banner.sort_order}
                                                </td>
                                                <td className="hidden max-w-56 truncate px-4 py-3 text-muted-foreground lg:table-cell">
                                                    {banner.link_url ?? '—'}
                                                </td>
                                                <td className="hidden px-4 py-3 md:table-cell">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                                                            banner.is_active
                                                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                                                : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                                                        }`}
                                                    >
                                                        {banner.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
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
                                                                href={showBanner(
                                                                    {
                                                                        banner: banner.id,
                                                                    },
                                                                )}
                                                            >
                                                                <Eye className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'View {name}',
                                                                        {
                                                                            name: banner.title,
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
                                                                href={editBanner(
                                                                    {
                                                                        banner: banner.id,
                                                                    },
                                                                )}
                                                            >
                                                                <Pencil className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'Edit {name}',
                                                                        {
                                                                            name: banner.title,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                        <Form
                                                            {...BannerController.destroy.form(
                                                                {
                                                                    banner: banner.id,
                                                                },
                                                            )}
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
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                                            >
                                                                <Trash2 className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'Delete {name}',
                                                                        {
                                                                            name: banner.title,
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
                                    <ImageIcon className="size-7" />
                                </div>
                                <h2 className="text-lg font-semibold">
                                    {t('No banners found')}
                                </h2>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    {filters.search || filters.status
                                        ? t('Try a different search term.')
                                        : t(
                                              'Add your first banner to promote a sale or new set on the store front page.',
                                          )}
                                </p>
                                {!filters.search && !filters.status && (
                                    <Button asChild className="mt-2">
                                        <Link href={createBanner()}>
                                            <Plus className="size-4" />
                                            {t('Add banner')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}

                        {banners.last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
                                <p className="text-sm text-muted-foreground">
                                    {t('Showing {from} to {to} of {total}', {
                                        from: banners.from as number,
                                        to: banners.to as number,
                                        total: banners.total,
                                    })}
                                </p>
                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: banners.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => {
                                        const isActive =
                                            page === banners.current_page;

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
                                                    href={bannersIndex.url({
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

BannersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Banners',
            href: bannersIndex(),
        },
    ],
};
