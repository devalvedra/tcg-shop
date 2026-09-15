import { Form, Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2, UserRound } from 'lucide-react';
import CustomerController from '@/actions/App/Http/Controllers/Admin/CustomerController';
import { SortableTh } from '@/components/sortable-th';
import type { SortDirection } from '@/components/sortable-th';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import { t } from '@/lib/i18n';
import {
    create as createCustomer,
    edit as editCustomer,
    index as customersIndex,
    show as showCustomer,
    status as updateCustomerStatus,
} from '@/routes/admin/customers';
import type { PaginatedData, User } from '@/types';

type Props = {
    customers: PaginatedData<User>;
    customerStatuses: Record<string, string>;
    filters: {
        search?: string;
        sort?: string;
        direction?: SortDirection;
    };
};

const statusStyles: Record<string, string> = {
    verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

export default function CustomersIndex({
    customers,
    customerStatuses,
    filters,
}: Props) {
    const getInitials = useInitials();
    const direction: SortDirection =
        filters.direction === 'desc' ? 'desc' : 'asc';

    const sortQuery = {
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.sort ? { sort: filters.sort } : {}),
        ...(filters.sort && filters.direction
            ? { direction: filters.direction }
            : {}),
    };

    const sortHref = (sortKey: string, sortDirection: SortDirection) =>
        customersIndex.url({
            query: { ...sortQuery, sort: sortKey, direction: sortDirection },
        });

    const toggleStatus = (customer: User) => {
        const next = customer.status === 'verified' ? 'pending' : 'verified';

        const confirmed = window.confirm(
            next === 'verified'
                ? t('Mark {name} as verified?', {
                      name: customer.name,
                  })
                : t('Set {name} to waiting for verification?', {
                      name: customer.name,
                  }),
        );

        if (!confirmed) {
            return;
        }

        router.patch(
            updateCustomerStatus.url({ customer: customer.id }),
            { status: next },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={t('Customers')} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('Customers')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t(
                                'Manage your collectors and their contact details',
                            )}
                        </p>
                    </div>
                    <Button asChild className="shadow-lg shadow-primary/25">
                        <Link href={createCustomer()}>
                            <Plus className="size-4" />
                            {t('Add customer')}
                        </Link>
                    </Button>
                </div>

                <Card className="gap-0 overflow-hidden py-0">
                    <CardContent className="p-0">
                        <div className="border-b p-4">
                            <Form
                                {...CustomerController.index.form()}
                                className="flex gap-2"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        defaultValue={filters.search}
                                        className="pl-9"
                                        placeholder={t(
                                            'Search by name, phone, or email...',
                                        )}
                                    />
                                </div>
                                <Button type="submit" variant="outline">
                                    {t('Search')}
                                </Button>
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
                            </Form>
                        </div>

                        {customers.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <SortableTh
                                                label={t('Customer')}
                                                sortKey="name"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                            />
                                            <SortableTh
                                                label={t('Phone')}
                                                sortKey="phone"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden md:table-cell"
                                            />
                                            <SortableTh
                                                label={t('Added')}
                                                sortKey="added"
                                                sort={filters.sort}
                                                direction={direction}
                                                getHref={sortHref}
                                                className="hidden lg:table-cell"
                                            />
                                            <th className="px-4 py-3 font-medium">
                                                {t('Status')}
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                {t('Actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {customers.data.map((customer) => (
                                            <tr
                                                key={customer.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                                                            {getInitials(
                                                                customer.name,
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">
                                                                {customer.name}
                                                            </p>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {customer.email ??
                                                                    t(
                                                                        'No email',
                                                                    )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                    {customer.phone ?? '—'}
                                                </td>
                                                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                                                    {new Date(
                                                        customer.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        title={t(
                                                            'Change status',
                                                        )}
                                                        onClick={() =>
                                                            toggleStatus(
                                                                customer,
                                                            )
                                                        }
                                                        className={`inline-flex cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[customer.status ?? 'verified']}`}
                                                    >
                                                        {t(
                                                            customerStatuses[
                                                                customer.status ??
                                                                    'verified'
                                                            ] ?? 'Verified',
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <Link
                                                                href={showCustomer(
                                                                    {
                                                                        customer:
                                                                            customer.id,
                                                                    },
                                                                )}
                                                            >
                                                                <Eye className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'View {name}',
                                                                        {
                                                                            name: customer.name,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <Link
                                                                href={editCustomer(
                                                                    {
                                                                        customer:
                                                                            customer.id,
                                                                    },
                                                                )}
                                                            >
                                                                <Pencil className="size-4" />
                                                                <span className="sr-only">
                                                                    {t(
                                                                        'Edit {name}',
                                                                        {
                                                                            name: customer.name,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                        <Form
                                                            {...CustomerController.destroy.form(
                                                                {
                                                                    customer:
                                                                        customer.id,
                                                                },
                                                            )}
                                                            onSubmit={(e) => {
                                                                if (
                                                                    !window.confirm(
                                                                        t(
                                                                            'Delete {name}? This cannot be undone.',
                                                                            {
                                                                                name: customer.name,
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
                                                                            name: customer.name,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </Button>
                                                        </Form>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                    <UserRound className="size-7" />
                                </div>
                                <h2 className="text-lg font-semibold">
                                    {t('No customers found')}
                                </h2>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    {filters.search
                                        ? t('Try a different search term.')
                                        : t(
                                              'Add your first customer to start building your collector community.',
                                          )}
                                </p>
                                {!filters.search && (
                                    <Button asChild className="mt-2">
                                        <Link href={createCustomer()}>
                                            <Plus className="size-4" />
                                            {t('Add customer')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}

                        {customers.last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
                                <p className="text-sm text-muted-foreground">
                                    {t('Showing {from} to {to} of {total}', {
                                        from: customers.from as number,
                                        to: customers.to as number,
                                        total: customers.total,
                                    })}
                                </p>
                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: customers.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => {
                                        const isActive =
                                            page === customers.current_page;

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
                                                    href={customersIndex.url({
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

CustomersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Customers',
            href: customersIndex(),
        },
    ],
};
