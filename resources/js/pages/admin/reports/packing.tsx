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

type CustomerGroup = {
    user_name: string;
    quantity: number;
    addresses: string[];
};

type ProductGroup = {
    product_name: string;
    quantity: number;
    customers: CustomerGroup[];
};

/**
 * Fold the flat packing rows into product groups, then customer groups, so
 * the table reads as "this many of this card for this person at this address".
 */
const groupRows = (rows: Row[]): ProductGroup[] => {
    const products = new Map<string, ProductGroup>();

    for (const row of rows) {
        let product = products.get(row.product_name);

        if (!product) {
            product = {
                product_name: row.product_name,
                quantity: 0,
                customers: [],
            };
            products.set(row.product_name, product);
        }

        let customer = product.customers.find(
            (group) => group.user_name === row.user_name,
        );

        if (!customer) {
            customer = {
                user_name: row.user_name,
                quantity: 0,
                addresses: [],
            };
            product.customers.push(customer);
        }

        product.quantity += row.quantity;
        customer.quantity += row.quantity;

        if (row.address && !customer.addresses.includes(row.address)) {
            customer.addresses.push(row.address);
        }
    }

    return [...products.values()];
};

type Props = {
    rows: Row[];
    filters: Filters;
};

export default function PackingReport({ rows, filters }: Props) {
    const groups = groupRows(rows);

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
                                <Button type="submit" variant="outline">
                                    <Search className="size-4" />
                                    {t('Search')}
                                </Button>
                            </Form>
                        </div>

                        {groups.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm max-md:[&_td]:align-top max-md:[&_th]:align-top">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="px-4 py-3 font-medium">
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
                                    {groups.map((product) => (
                                        <tbody
                                            key={product.product_name}
                                            className="divide-y divide-border"
                                        >
                                            <tr className="border-t-2 border-border bg-muted/60">
                                                <td
                                                    colSpan={3}
                                                    className="px-4 py-2.5"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span className="flex items-center gap-2 font-semibold">
                                                            <Package className="size-4 text-indigo-600" />
                                                            {
                                                                product.product_name
                                                            }
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {t('Total')}:{' '}
                                                            {product.quantity}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {product.customers.map(
                                                (customer) => (
                                                    <tr
                                                        key={customer.user_name}
                                                        className="hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-3 font-medium">
                                                            {customer.user_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {customer.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {customer.addresses
                                                                .length > 0
                                                                ? customer.addresses.map(
                                                                      (
                                                                          address,
                                                                      ) => (
                                                                          <p
                                                                              key={
                                                                                  address
                                                                              }
                                                                          >
                                                                              {
                                                                                  address
                                                                              }
                                                                          </p>
                                                                      ),
                                                                  )
                                                                : '—'}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    ))}
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
