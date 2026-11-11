import { Form, Head, router } from '@inertiajs/react';
import { Download, Package, Search, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import reportsRoutes, { packing } from '@/routes/admin/reports';

type GroupKind = 'product' | 'customer';

type Filters = {
    search?: string | null;
    group?: string | null;
};

type Row = {
    product_name: string;
    order_date: string | null;
    user_name: string;
    quantity: number;
    address: string;
};

type GroupRow = {
    label: string;
    quantity: number;
    addresses: string[];
};

type Group = {
    label: string;
    quantity: number;
    rows: GroupRow[];
};

/**
 * Fold the flat packing rows into one level of groups, then a second level.
 * Grouping by product lists customers underneath; grouping by customer lists
 * products underneath.
 */
const groupRows = (rows: Row[], groupBy: GroupKind): Group[] => {
    const groups = new Map<string, Group>();

    for (const row of rows) {
        const groupLabel =
            groupBy === 'product' ? row.product_name : row.user_name;
        const rowLabel =
            groupBy === 'product' ? row.user_name : row.product_name;

        let group = groups.get(groupLabel);

        if (!group) {
            group = { label: groupLabel, quantity: 0, rows: [] };
            groups.set(groupLabel, group);
        }

        let entry = group.rows.find((item) => item.label === rowLabel);

        if (!entry) {
            entry = { label: rowLabel, quantity: 0, addresses: [] };
            group.rows.push(entry);
        }

        group.quantity += row.quantity;
        entry.quantity += row.quantity;

        if (row.address && !entry.addresses.includes(row.address)) {
            entry.addresses.push(row.address);
        }
    }

    return [...groups.values()];
};

type Props = {
    rows: Row[];
    filters: Filters;
};

export default function PackingReport({ rows, filters }: Props) {
    const [groupBy, setGroupBy] = useState<GroupKind>(
        filters.group === 'customer' ? 'customer' : 'product',
    );
    const [search, setSearch] = useState(filters.search ?? '');

    const isCustomerGroup = groupBy === 'customer';
    const groups = groupRows(rows, groupBy);

    const query = {
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(groupBy === 'customer' ? { group: 'customer' } : {}),
    };

    /**
     * Switching grouping changes what the search field matches, so the old
     * term is cleared to avoid searching a customer name against products
     * (or the other way around). When there was a term, the rows are refetched
     * under the new grouping with the search removed.
     */
    const changeGroup = (group: GroupKind) => {
        const hadSearch = search.trim() !== '';

        setGroupBy(group);
        setSearch('');

        if (hadSearch) {
            router.get(
                packing.url({
                    query: group === 'customer' ? { group: 'customer' } : {},
                }),
                {},
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }
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
                                        {t('Group by')}
                                    </span>
                                    <div className="flex h-9 items-center gap-3 rounded-md border border-input px-3">
                                        <label className="flex items-center gap-1.5 text-xs">
                                            <input
                                                type="radio"
                                                name="group"
                                                value="product"
                                                checked={groupBy === 'product'}
                                                onChange={() =>
                                                    changeGroup('product')
                                                }
                                                className="size-3.5 accent-indigo-600"
                                            />
                                            {t('Product')}
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs">
                                            <input
                                                type="radio"
                                                name="group"
                                                value="customer"
                                                checked={groupBy === 'customer'}
                                                onChange={() =>
                                                    changeGroup('customer')
                                                }
                                                className="size-3.5 accent-indigo-600"
                                            />
                                            {t('Customer')}
                                        </label>
                                    </div>
                                </div>
                                <div className="grid gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                        {t(
                                            isCustomerGroup
                                                ? 'Customer name'
                                                : 'Product name',
                                        )}
                                    </span>
                                    <Input
                                        name="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder={t(
                                            isCustomerGroup
                                                ? 'Search customer'
                                                : 'Search product',
                                        )}
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
                                                {t(
                                                    isCustomerGroup
                                                        ? 'Product'
                                                        : 'Customer',
                                                )}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Quantity')}
                                            </th>
                                            <th className="w-[500px] px-4 py-3 font-medium">
                                                {t('Address')}
                                            </th>
                                        </tr>
                                    </thead>
                                    {groups.map((group) => (
                                        <tbody
                                            key={group.label}
                                            className="divide-y divide-border"
                                        >
                                            <tr className="border-t-2 border-border bg-muted/60">
                                                <td
                                                    colSpan={3}
                                                    className="px-4 py-2.5"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span className="flex items-center gap-2 font-semibold">
                                                            {isCustomerGroup ? (
                                                                <UserRound className="size-4 text-indigo-600" />
                                                            ) : (
                                                                <Package className="size-4 text-indigo-600" />
                                                            )}
                                                            {group.label}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {t('Total')}:{' '}
                                                            {group.quantity}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {group.rows.map((entry) => (
                                                <tr
                                                    key={entry.label}
                                                    className="hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        {entry.label}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {entry.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {entry.addresses
                                                            .length > 0
                                                            ? entry.addresses.map(
                                                                  (address) => (
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
                                            ))}
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
