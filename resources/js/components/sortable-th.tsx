import { Link } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc';

type SortableThProps = {
    label: string;
    sortKey: string;
    sort?: string;
    direction?: SortDirection;
    getHref: (sort: string, direction: SortDirection) => string;
    className?: string;
};

export function SortableTh({
    label,
    sortKey,
    sort,
    direction = 'asc',
    getHref,
    className,
}: SortableThProps) {
    const isActive = sort === sortKey;
    const nextDirection: SortDirection =
        isActive && direction === 'asc' ? 'desc' : 'asc';
    const Icon = isActive
        ? direction === 'asc'
            ? ArrowUp
            : ArrowDown
        : ArrowUpDown;

    return (
        <th className={cn('px-4 py-3', className)}>
            <Link
                href={getHref(sortKey, nextDirection)}
                preserveScroll
                className="group inline-flex items-center gap-1 rounded-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                <span>{label}</span>
                <Icon
                    className={cn(
                        'size-3.5 shrink-0 transition-opacity',
                        isActive
                            ? 'text-foreground'
                            : 'text-muted-foreground opacity-40 group-hover:opacity-100',
                    )}
                />
            </Link>
        </th>
    );
}
