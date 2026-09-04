import { Form, Head, Link } from '@inertiajs/react';
import { Download, ReceiptText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { show as showOrder } from '@/routes/admin/orders';
import reportsRoutes, { customerOrders } from '@/routes/admin/reports';

type Filters = {
    from?: string | null;
    to?: string | null;
    customer?: string | null;
};

type Row = {
    customer_name: string;
    created_at: string;
    date: string;
    order_id: number;
    order_number: string;
    product_name: string;
    quantity: number;
};

type Props = {
    rows: Row[];
    filters: Filters;
};

const hasFilters = (filters: Filters) =>
    Boolean(filters.customer);

export default function CustomerOrdersReport({ rows, filters }: Props) {
    const query = {
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.customer ? { customer: filters.customer } : {}),
    };

    const customerRuns = Array(rows.length).fill(0) as number[];
    const dateRuns = Array(rows.length).fill(0) as number[];
    const orderRuns = Array(rows.length).fill(0) as number[];

    let i = 0;

    while (i < rows.length) {
        const customer = rows[i].customer_name;
        let j = i;

        while (
            j < rows.length &&
            rows[j].customer_name === customer
        ) {
            const date = rows[j].date;
            let k = j;

            while (
                k < rows.length &&
                rows[k].customer_name === customer &&
                rows[k].date === date
            ) {
                const order = rows[k].order_number;
                const start = k;

                while (
                    k < rows.length &&
                    rows[k].customer_name === customer &&
                    rows[k].date === date &&
                    rows[k].order_number === order
                ) {
                    k += 1;
                }

                orderRuns[start] = k - start;
            }

            dateRuns[j] = k - j;
            j = k;
        }

        customerRuns[i] = j - i;
        i = j;
    }

    return (
        <>
            <Head title={t('Customer orders')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Customer orders')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'What kind of products were bought by the customers',
                            )}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <a
                            href={
                                reportsRoutes.customerOrders.export.url({
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
                                {...customerOrders.form()}
                                className="flex flex-wrap items-end gap-3"
                            >
                                <div className="grid gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                        {t('Customer name')}
                                    </span>
                                    <Input
                                        name="customer"
                                        defaultValue={
                                            filters.customer ?? ''
                                        }
                                        placeholder={t('Filter by customer')}
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
                                        <Link href={customerOrders()}>
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
                                                {t('Customer')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Date')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Order')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Product')}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Quantity')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rows.map((row, index) => {
                                            const isCustomerStart =
                                                customerRuns[index] > 0;
                                            const isDateStart =
                                                dateRuns[index] > 0;
                                            const isOrderStart =
                                                orderRuns[index] > 0;

                                            return (
                                                <tr
                                                    key={`${row.order_number}-${index}`}
                                                    className={cn(
                                                        isCustomerStart &&
                                                            'border-t-2',
                                                    )}
                                                >
                                                    {isCustomerStart && (
                                                        <td
                                                            rowSpan={
                                                                customerRuns[
                                                                    index
                                                                ]
                                                            }
                                                            className="px-4 py-3 font-semibold align-top"
                                                        >
                                                            {
                                                                row.customer_name
                                                            }
                                                        </td>
                                                    )}
                                                    {isDateStart && (
                                                        <td
                                                            rowSpan={
                                                                dateRuns[
                                                                    index
                                                                ]
                                                            }
                                                            className="px-4 py-3 text-muted-foreground align-top"
                                                        >
                                                            {row.date}
                                                        </td>
                                                    )}
                                                    {isOrderStart && (
                                                        <td
                                                            rowSpan={
                                                                orderRuns[
                                                                    index
                                                                ]
                                                            }
                                                            className="px-4 py-3 align-top"
                                                        >
                                                            <Link
                                                                href={showOrder(
                                                                    {
                                                                        order: row.order_id,
                                                                    },
                                                                )}
                                                                className="font-mono text-xs text-indigo-600 hover:underline"
                                                            >
                                                                {
                                                                    row.order_number
                                                                }
                                                            </Link>
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3">
                                                        {row.product_name}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {row.quantity}
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
                                    <ReceiptText className="size-7" />
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

CustomerOrdersReport.layout = {
    breadcrumbs: [
        {
            title: t('Customer orders'),
            href: customerOrders(),
        },
    ],
};
