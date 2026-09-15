import { Form, Head, Link } from '@inertiajs/react';
import { Download, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import reportsRoutes, { customerBuying } from '@/routes/admin/reports';

type Filters = {
    from?: string | null;
    to?: string | null;
    customer?: string | null;
};

type Row = {
    id: number;
    name: string;
    phone: string | null;
    products_bought: number;
    money_spent: number;
};

type Props = {
    rows: Row[];
    filters: Filters;
};

const hasFilters = (filters: Filters) =>
    Boolean(filters.from || filters.to || filters.customer);

export default function CustomerBuyingReport({ rows, filters }: Props) {
    const query = {
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.customer ? { customer: filters.customer } : {}),
    };

    return (
        <>
            <Head title={t('Customer buying')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Customer buying')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Products bought and money spent per customer')}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <a
                            href={reportsRoutes.customerBuying.export.url({
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
                                {...customerBuying.form()}
                                className="flex flex-wrap items-end gap-3"
                            >
                                <div className="grid gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                        {t('Customer name')}
                                    </span>
                                    <Input
                                        name="customer"
                                        defaultValue={filters.customer ?? ''}
                                        placeholder={t('Search by customer')}
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
                                        <Link href={customerBuying()}>
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
                                                {t('Customer')}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Products bought')}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Money spent')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rows.map((row, index) => (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    #{index + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">
                                                        {row.name}
                                                    </p>
                                                    {row.phone && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {row.phone}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {row.products_bought}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {formatCurrency(
                                                        row.money_spent,
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
                                    <Users className="size-7" />
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

CustomerBuyingReport.layout = {
    breadcrumbs: [
        {
            title: t('Customer buying'),
            href: customerBuying(),
        },
    ],
};
