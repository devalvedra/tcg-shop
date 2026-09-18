import { Form, Head } from '@inertiajs/react';
import { Download, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import reportsRoutes, { packing } from '@/routes/admin/reports';

type Filters = {
    search?: string | null;
};

type Row = {
    product_name: string;
    order_date: string | null;
    user_name: string;
    quantity: number;
    address: string;
};

type Props = {
    rows: Row[];
    filters: Filters;
};

export default function PackingReport({ rows, filters }: Props) {
    const query = {
        ...(filters.search ? { search: filters.search } : {}),
    };

    return (
        <>
            <Head title={t('Packing')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Packing')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Items to pack from active orders')}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <a
                            href={reportsRoutes.packing.export.url({
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
                                {...packing.form()}
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
                                                {t('Product')}
                                            </th>
                                            <th className="hidden px-4 py-3 font-medium md:table-cell">
                                                {t('Order date')}
                                            </th>
                                            <th className="hidden px-4 py-3 font-medium md:table-cell">
                                                {t('Customer')}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Quantity')}
                                            </th>
                                            <th className="w-[500px] px-4 py-3 font-medium">
                                                {t('Address')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rows.map((row, index) => (
                                            <tr
                                                key={`${row.product_name}-${row.user_name}-${index}`}
                                                className="hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {row.product_name}
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                    {row.order_date ?? '—'}
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                    {row.user_name}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {row.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {row.address || '—'}
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

PackingReport.layout = {
    breadcrumbs: [
        {
            title: t('Packing'),
            href: packing(),
        },
    ],
};
