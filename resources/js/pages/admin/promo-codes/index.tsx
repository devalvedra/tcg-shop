import { Form, Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Search, Ticket, Trash2 } from 'lucide-react';
import PromoCodeController from '@/actions/App/Http/Controllers/Admin/PromoCodeController';
import { SortableTh } from '@/components/sortable-th';
import type { SortDirection } from '@/components/sortable-th';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import {
    create as createPromoCode,
    edit as editPromoCode,
    index as promoCodesIndex,
} from '@/routes/admin/promo-codes';
import type { PaginatedData, PromoCode } from '@/types';

type Props = {
    promoCodes: PaginatedData<PromoCode>;
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        direction?: SortDirection;
    };
};

const nativeSelectClasses =
    'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

const promoStatus = (promo: PromoCode) => {
    if (!promo.is_active) {
        return {
            label: t('Inactive'),
            styles: 'bg-muted text-muted-foreground ring-border',
        };
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        return {
            label: t('Expired'),
            styles: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        };
    }

    if (promo.starts_at && new Date(promo.starts_at) > new Date()) {
        return {
            label: t('Scheduled'),
            styles: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        };
    }

    return {
        label: t('Active'),
        styles: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    };
};

const discountLabel = (promo: PromoCode) => {
    if (promo.discount_type === 'percent') {
        const base = t('{value}% off', { value: promo.discount_value });

        return promo.max_discount
            ? t('{base} (up to {max})', {
                  base,
                  max: formatCurrency(promo.max_discount),
              })
            : base;
    }

    return t('{value} off', { value: formatCurrency(promo.discount_value) });
};

export default function PromoCodesIndex({ promoCodes, filters }: Props) {
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
        promoCodesIndex.url({
            query: { ...sortQuery, sort: sortKey, direction: sortDirection },
        });

    return (
        <>
            <Head title={t('Promo Codes')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Promo codes')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'Manage the discount codes customers use at checkout',
                            )}
                        </p>
                    </div>
                    <Button asChild className="shadow-lg shadow-primary/25">
                        <Link href={createPromoCode()}>
                            <Plus className="size-4" />
                            {t('Add promo code')}
                        </Link>
                    </Button>
                </div>

                <Card className="gap-0 overflow-hidden py-0">
                    <CardContent className="p-0">
                        <div className="border-b p-4">
                            <Form
                                {...PromoCodeController.index.form()}
                                className="flex flex-col gap-2 lg:flex-row lg:items-center"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        defaultValue={filters.search}
                                        className="pl-9"
                                        placeholder={t(
                                            'Search by code or name...',
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

                        {promoCodes.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <SortableTh
                                                label={t('Code')}
                                                sortKey="code"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                            />
                                            <SortableTh
                                                label={t('Name')}
                                                sortKey="name"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden md:table-cell"
                                            />
                                            <th className="hidden px-4 py-3 font-medium lg:table-cell">
                                                {t('Discount')}
                                            </th>
                                            <th className="hidden px-4 py-3 font-medium md:table-cell">
                                                {t('Status')}
                                            </th>
                                            <SortableTh
                                                label={t('Uses')}
                                                sortKey="uses"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden lg:table-cell"
                                            />
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {promoCodes.data.map((promo) => {
                                            const status = promoStatus(promo);

                                            return (
                                                <tr
                                                    key={promo.id}
                                                    className="hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1 font-mono text-xs font-semibold tracking-wide">
                                                            <Ticket className="size-3.5" />
                                                            {promo.code}
                                                        </span>
                                                    </td>
                                                    <td className="hidden px-4 py-3 md:table-cell">
                                                        <p className="font-medium">
                                                            {promo.name}
                                                        </p>
                                                        {promo.description && (
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {
                                                                    promo.description
                                                                }
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                                                        {discountLabel(promo)}
                                                    </td>
                                                    <td className="hidden px-4 py-3 md:table-cell">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${status.styles}`}
                                                        >
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                                                        {promo.usage_limit
                                                            ? `${promo.uses_count} / ${promo.usage_limit}`
                                                            : promo.uses_count}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                asChild
                                                                variant="ghost"
                                                                size="icon"
                                                            >
                                                                <Link
                                                                    href={editPromoCode(
                                                                        {
                                                                            promo_code:
                                                                                promo.id,
                                                                        },
                                                                    )}
                                                                >
                                                                    <Pencil className="size-4" />
                                                                    <span className="sr-only">
                                                                        {t(
                                                                            'Edit {name}',
                                                                            {
                                                                                name: promo.code,
                                                                            },
                                                                        )}
                                                                    </span>
                                                                </Link>
                                                            </Button>
                                                            <Form
                                                                {...PromoCodeController.destroy.form(
                                                                    {
                                                                        promo_code:
                                                                            promo.id,
                                                                    },
                                                                )}
                                                                onSubmit={(
                                                                    e,
                                                                ) => {
                                                                    if (
                                                                        !window.confirm(
                                                                            t(
                                                                                'Delete {name}? This cannot be undone.',
                                                                                {
                                                                                    name: promo.code,
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
                                                                                name: promo.code,
                                                                            },
                                                                        )}
                                                                    </span>
                                                                </Button>
                                                            </Form>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                                    <Ticket className="size-7" />
                                </div>
                                <h2 className="text-lg font-semibold">
                                    {t('No promo codes found')}
                                </h2>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    {filters.search || filters.status
                                        ? t('Try a different search term.')
                                        : t(
                                              'Create a discount code to start rewarding your customers.',
                                          )}
                                </p>
                                {!filters.search && !filters.status && (
                                    <Button asChild className="mt-2">
                                        <Link href={createPromoCode()}>
                                            <Plus className="size-4" />
                                            {t('Add promo code')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}

                        {promoCodes.last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
                                <p className="text-sm text-muted-foreground">
                                    {t('Showing {from} to {to} of {total}', {
                                        from: promoCodes.from as number,
                                        to: promoCodes.to as number,
                                        total: promoCodes.total,
                                    })}
                                </p>
                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: promoCodes.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => {
                                        const isActive =
                                            page === promoCodes.current_page;

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
                                                    href={promoCodesIndex.url({
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

PromoCodesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Promo Codes',
            href: promoCodesIndex(),
        },
    ],
};
