import { Form, Head, Link } from '@inertiajs/react';
import { Download, Package, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import { show as showOrder } from '@/routes/admin/orders';
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

type HistoryOrder = {
    order_id: number;
    order_number: string;
    customer_name: string;
    date: string;
    quantity: number;
};

const selectClasses =
    'h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

export default function SellingProductsReport({
    rows,
    filters,
    orderStatuses,
    productTypes,
}: Props) {
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryOrder[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const query = {
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.statuses && filters.statuses.length > 0
            ? { statuses: filters.statuses }
            : {}),
    };

    const openHistory = async (product: string) => {
        setSelectedProduct(product);
        setHistory([]);
        setHistoryLoading(true);

        try {
            const response = await fetch(
                reportsRoutes.sellingProducts.history.url({
                    query: {
                        product,
                        ...(filters.from ? { from: filters.from } : {}),
                        ...(filters.to ? { to: filters.to } : {}),
                        ...(filters.statuses && filters.statuses.length > 0
                            ? { statuses: filters.statuses }
                            : {}),
                    },
                }),
                { headers: { Accept: 'application/json' } },
            );

            if (!response.ok) {
                throw new Error('Failed to load order history');
            }

            const data = (await response.json()) as {
                orders?: HistoryOrder[];
            };

            setHistory(data.orders ?? []);
        } catch {
            setHistory([]);
        } finally {
            setHistoryLoading(false);
        }
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
                                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
                            >
                                <div className="grid gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                        {t('Product name')}
                                    </span>
                                    <Input
                                        name="search"
                                        defaultValue={filters.search ?? ''}
                                        placeholder={t('Search product')}
                                        className="w-full sm:w-52"
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
                                        className="w-full sm:w-40"
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
                                        className="w-full sm:w-40"
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
                                <table className="w-full text-sm max-md:[&_td]:align-top max-md:[&_th]:align-top">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="px-4 py-3 font-medium">
                                                {t('Rank #')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Product')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Product type')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Category')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Created date')}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
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
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openHistory(
                                                                row.product_name,
                                                            )
                                                        }
                                                        className="text-left text-indigo-600 hover:underline"
                                                    >
                                                        {row.product_name}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
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
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {row.category || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {row.created_at ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
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

                <Dialog
                    open={selectedProduct !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedProduct(null);
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-2xl">
                        <DialogTitle>
                            {t('Order history for {product}', {
                                product: selectedProduct ?? '',
                            })}
                        </DialogTitle>

                        {historyLoading ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                {t('Loading order history...')}
                            </p>
                        ) : history.length > 0 ? (
                            <div className="max-h-[60vh] overflow-y-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-background">
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="px-4 py-2.5 font-medium">
                                                {t('Order')}
                                            </th>
                                            <th className="px-4 py-2.5 font-medium">
                                                {t('Customer')}
                                            </th>
                                            <th className="px-4 py-2.5 font-medium">
                                                {t('Date')}
                                            </th>
                                            <th className="px-4 py-2.5 text-right font-medium">
                                                {t('Quantity')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {history.map((order) => (
                                            <tr
                                                key={`${order.order_id}-${order.order_number}`}
                                                className="hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-2.5">
                                                    <Link
                                                        href={showOrder({
                                                            order: order.order_number,
                                                        })}
                                                        className="font-mono text-xs text-indigo-600 hover:underline"
                                                    >
                                                        {order.order_number}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-2.5 text-muted-foreground">
                                                    {order.customer_name}
                                                </td>
                                                <td className="px-4 py-2.5 text-muted-foreground">
                                                    {order.date || '—'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    {order.quantity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                {t('No orders found for this product.')}
                            </p>
                        )}
                    </DialogContent>
                </Dialog>
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
