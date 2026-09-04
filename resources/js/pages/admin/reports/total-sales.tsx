import { Form, Head, Link } from '@inertiajs/react';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import { show as showOrder } from '@/routes/admin/orders';
import reportsRoutes, { totalSales } from '@/routes/admin/reports';

type Filters = {
    from?: string | null;
    to?: string | null;
};

type OrderRow = {
    type: 'order';
    month: string;
    date: string;
    order_id: number;
    order_number: string;
    total: number;
};

type DateTotalRow = {
    type: 'date_total';
    month: string;
    date: string;
    total: number;
};

type MonthTotalRow = {
    type: 'month_total';
    month: string;
    date: null;
    total: number;
};

type GrandTotalRow = {
    type: 'grand_total';
    month: null;
    date: null;
    total: number;
};

type ReportRow = OrderRow | DateTotalRow | MonthTotalRow | GrandTotalRow;

type Props = {
    rows: ReportRow[];
    filters: Filters;
};

const hasFilters = (filters: Filters) => Boolean(filters.from || filters.to);

export default function TotalSalesReport({ rows, filters }: Props) {
    const query = {
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
    };

    const monthRuns = Array(rows.length).fill(0) as number[];
    const dateRuns = Array(rows.length).fill(0) as number[];

    let i = 0;

    while (i < rows.length) {
        const month = rows[i].month;

        if (month === null) {
            i += 1;

            continue;
        }

        let j = i;

        while (j < rows.length && rows[j].month === month) {
            j += 1;
        }

        monthRuns[i] = j - i;
        i = j;
    }

    i = 0;

    while (i < rows.length) {
        if (rows[i].type !== 'order') {
            i += 1;

            continue;
        }

        const date = rows[i].date;
        let j = i;

        while (
            j < rows.length &&
            rows[j].type === 'order' &&
            rows[j].date === date
        ) {
            j += 1;
        }

        dateRuns[i] = j - i;
        i = j;
    }

    return (
        <>
            <Head title={t('Total sales')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Total sales')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Summary of total orders and total income')}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <a
                            href={reportsRoutes.totalSales.export.url({
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
                                {...totalSales.form()}
                                className="flex flex-wrap items-end gap-3"
                            >
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
                                        <Link href={totalSales()}>
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
                                                {t('Month')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Date')}
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                {t('Order id')}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Total')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rows.map((row, index) => {
                                            const isMonthStart =
                                                monthRuns[index] > 0;
                                            const isDateStart =
                                                dateRuns[index] > 0;

                                            if (row.type === 'order') {
                                                return (
                                                    <tr key={index}>
                                                        {isMonthStart && (
                                                            <td
                                                                rowSpan={
                                                                    monthRuns[
                                                                        index
                                                                    ] - 1
                                                                }
                                                                className="px-4 py-3 align-top font-medium"
                                                            >
                                                                {row.month}
                                                            </td>
                                                        )}
                                                        {isDateStart && (
                                                            <td
                                                                rowSpan={
                                                                    dateRuns[
                                                                        index
                                                                    ] + 1
                                                                }
                                                                className="px-4 py-3 align-top text-muted-foreground"
                                                            >
                                                                {row.date}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-3">
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
                                                        <td className="px-4 py-3 text-right">
                                                            {formatCurrency(
                                                                row.total,
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            if (row.type === 'date_total') {
                                                return (
                                                    <tr
                                                        key={index}
                                                        className="border-b-4"
                                                    >
                                                        <td
                                                            colSpan={3}
                                                            className="text-md px-4 py-3 text-right font-bold"
                                                        >
                                                            {formatCurrency(
                                                                row.total,
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            if (row.type === 'month_total') {
                                                return (
                                                    <tr
                                                        key={index}
                                                        className="border-t bg-muted/60"
                                                    >
                                                        <td
                                                            colSpan={3}
                                                            className="text-md px-4 py-3 text-right font-semibold"
                                                        >
                                                            {t('Subtotal')}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-base font-bold">
                                                            {formatCurrency(
                                                                row.total,
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <tr
                                                    key={index}
                                                    className="border-t-2 border-foreground/20 bg-primary/10"
                                                >
                                                    <td
                                                        colSpan={3}
                                                        className="px-4 py-3 text-lg font-bold"
                                                    >
                                                        {t('Total')}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-lg font-extrabold text-primary">
                                                        {formatCurrency(
                                                            row.total,
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
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

TotalSalesReport.layout = {
    breadcrumbs: [
        {
            title: t('Total sales'),
            href: totalSales(),
        },
    ],
};
