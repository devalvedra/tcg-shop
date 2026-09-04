import { Form, Head, Link } from '@inertiajs/react';
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
};

type Row = {
    product_name: string;
    category: string;
    created_at: string | null;
    stock: number;
    units_sold: number;
    total_revenue: number;
};

type Props = {
    rows: Row[];
    filters: Filters;
};

const hasFilters = (filters: Filters) =>
    Boolean(filters.from || filters.to || filters.search);

export default function SellingProductsReport({ rows, filters }: Props) {
    const query = {
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.search ? { search: filters.search } : {}),
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
                            href={
                                reportsRoutes.sellingProducts.export.url({
                                    query,
                                })
                            }
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
                                <Button type="submit" variant="outline">
                                    <Search className="size-4" />
                                    {t('Search')}
                                </Button>
                                {hasFilters(filters) && (
                                    <Button asChild variant="ghost">
                                        <Link href={sellingProducts()}>
                                            {t('Clear')}
                                        </Link>
                                    </Button>
                                )}
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
