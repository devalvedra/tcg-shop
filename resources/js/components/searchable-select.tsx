import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Option = {
    value: string;
    label: string;
};

type Props = {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
};

export function SearchableSelect({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    ariaLabel,
    className,
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);

    const selected = options.find((option) => option.value === value);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();

        if (!term) {
            return options;
        }

        return options.filter((option) =>
            option.label.toLowerCase().includes(term),
        );
    }, [options, query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                rootRef.current &&
                !rootRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectOption = (optionValue: string) => {
        onChange(optionValue);
        setOpen(false);
        setQuery('');
    };

    return (
        <div ref={rootRef} className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
                <span
                    className={cn(
                        'truncate',
                        !selected && 'text-muted-foreground',
                    )}
                >
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                    <div className="relative border-b p-2">
                        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                            aria-label={placeholder}
                            className="h-8 w-full rounded-md border border-input bg-background pr-2 pl-8 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                    </div>
                    <ul role="listbox" className="max-h-60 overflow-y-auto p-1">
                        {filtered.length > 0 ? (
                            filtered.map((option) => (
                                <li key={option.value}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={option.value === value}
                                        onClick={() =>
                                            selectOption(option.value)
                                        }
                                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent"
                                    >
                                        <span className="truncate">
                                            {option.label}
                                        </span>
                                        {option.value === value && (
                                            <Check className="size-4 shrink-0 text-indigo-600" />
                                        )}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-2 py-1.5 text-sm text-muted-foreground">
                                {t('No results')}
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
