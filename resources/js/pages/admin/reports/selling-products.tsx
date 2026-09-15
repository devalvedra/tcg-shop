import { Form, Head } from '@inertiajs/react';
import { Download, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import reportsRoutes, { sellingProducts } from '@/routes/admin/reports';

type Filters = {
    from?: string | null;
    to?: string | null;
    search?: string | null;
    type?: string | null;
    statuses?: string[];
};

type Row = {
    product_name: string;
    category: string;
    product_status: string;
    created_at: string | null;
    stock: number;
    units_sold: number;
    total_revenue: number;
};

type Props = {
    rows: Row[];
    filters: Filters;
    orderStatuses: Record<string, string>;
    productTypes: Record<string, string>;
};

const selectClasses =
    'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

export default function SellingProductsReport({
    rows,
    filters,
    orderStatuses,
    productTypes,
}: Props) {
    const query = {
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.statuses && filters.statuses.length > 0
            ? { statuses: filters.statuses }
            : {}),
    };

    return (
        <>
            <Head title={t('Selling products')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Selling products')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Products ordered by the most bought')}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <a
                            href={reportsRoutes.sellingProducts.export.url({
                                query,
                            })}
                        >
                            <Download className="size-4" />
                            {t('Export Excel')}
                        </a>
                    </Button>
                </div>

                <Card className="gap-0 overflow-hidden py-0">
                    <CardContent className="p-0">
                        <div className="border-b p-4">
                            <Form
                                {...sellingProducts.form()}
                                className="flex flex-wrap items-end gap-3"
                            >
                                <div className="grid gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                        {t('Product name')}
                                    </span>
                                    <Input
                                        name="search"
                                        defaultValue={filters.search ?? ''}
                                        placeholder={t('Search product')}
                                        className="w-52"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                        {t('From')}
                                    </span>
                                    <Input
                                        name="from"
                                        type="date"
                                        defaultValue={filters.from ?? ''}
                                        aria-label={t('From date')}
                                        className="w-40"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                        {t('To')}
                                    </span>
                                    <Input
                                        name="to"
                                        type="date"
                                        defaultValue={filters.to ?? ''}
                                        aria-label={t('To date')}
                                        className="w-40"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                        {t('Product type')}
                                    </span>
                                    <select
                                        name="type"
                                        defaultValue={filters.type ?? ''}
                                        className={selectClasses}
                                        aria-label={t('Product type')}
                                    >
                                        <option value="">
                                            {t('All types')}
                                        </option>
                                        {Object.entries(productTypes).map(
                                            ([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {t(label)}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                                <div className="grid gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                        {t('Order status')}
                                    </span>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-input px-3 py-2">
                                        {Object.entries(orderStatuses).map(
                                            ([value, label]) => (
                                                <label
                                                    key={value}
                                                    className="flex items-center gap-1.5 text-xs"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="statuses[]"
                                                        value={value}
                                                        defaultChecked={(
                                                            filters.statuses ??
                                                            []
                                                        ).includes(value)}
                                                        className="size-3.5 accent-indigo-600"
                                                    />
                                                    {t(label)}
                                                </label>
                                            ),
                                        )}
                                    </div>
                                </div>
                                <Button type="submit" variant="outline">
                                    <Search className="size-4" />
                                    {t('Search')}
                                </Button>
                            </Form>
                        </div>

                        {rows.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="px-4 py-3 font-medium">
                                                {t('Rank #')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Product')}
                                            </th>
                                            <th className="hidden px-4 py-3 font-medium md:table-cell">
                                                {t('Product type')}
                                            </th>
                                            <th className="hidden px-4 py-3 font-medium md:table-cell">
                                                {t('Category')}
                                            </th>
                                            <th className="hidden px-4 py-3 font-medium lg:table-cell">
                                                {t('Created date')}
                                            </th>
                                            <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                                                {t('Stock')}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Units sold')}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Revenue')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rows.map((row, index) => (
                                            <tr
                                                key={row.product_name}
                                                className="hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    #{index + 1}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {row.product_name}
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                    {row.product_status
                                                        ? t(
                                                              productTypes[
                                                                  row
                                                                      .product_status
                                                              ] ??
                                                                  row.product_status,
                                                          )
                                                        : '—'}
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                    {row.category || '—'}
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                                                    {row.created_at ?? '—'}
                                                </td>
                                                <td className="hidden px-4 py-3 text-right md:table-cell">
                                                    {row.stock}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {row.units_sold}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatCurrency(
                                                        row.total_revenue,
                                                    )}
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
                                    {t('No data found')}
                                </h2>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SellingProductsReport.layout = {
    breadcrumbs: [
        {
            title: t('Selling products'),
            href: sellingProducts(),
        },
    ],
};
