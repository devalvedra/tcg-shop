import { Link } from '@inertiajs/react';
import { Box, Gift, Package, ShoppingBag, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { t } from '@/lib/i18n';
import type { Product } from '@/types';
import type { RouteDefinition } from '@/wayfinder';

export const categoryIconMap: Record<string, LucideIcon> = {
    singles: Sparkles,
    'booster-boxes': Box,
    'booster-packs': Package,
    bundles: Gift,
    accessories: ShoppingBag,
};

export function ProductCard({
    product,
    href,
}: {
    product: Product;
    href?: string | RouteDefinition<'get'>;
}) {
    const Icon = categoryIconMap[product.category] ?? Package;
    const image = product.images[0]?.url;
    const price = product.sell_price ?? product.price;

    const card = (
        <Card className="group h-full gap-0 overflow-hidden py-0">
            <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/50 dark:to-violet-950/50">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
                        <Icon className="size-7" />
                    </div>
                )}
                {product.status === 'pre-order' && (
                    <Badge className="absolute top-3 left-3 rounded-full bg-amber-500 text-white ring-0 hover:bg-amber-500">
                        {t('Pre-order')}
                    </Badge>
                )}
            </div>
            <CardContent className="flex flex-1 flex-col gap-1 p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {product.category_name}
                </p>
                <p className="truncate font-medium">{product.name}</p>
                <div className="mt-1 flex flex-col gap-0.5">
                    <span className="text-lg font-semibold">
                        {formatCurrency(price)}
                    </span>
                    {product.status === 'pre-order' && (
                        <span className="text-[10px] font-medium tracking-wide text-amber-600 uppercase dark:text-amber-400">
                            {t('Pre-order')}
                        </span>
                    )}
                </div>
                <p className="mt-auto text-xs text-muted-foreground">
                    {product.stock === 0
                        ? t('Out of stock')
                        : product.stock <= 5
                          ? t('{count} left in stock', {
                                count: product.stock,
                            })
                          : t('In stock')}
                </p>
            </CardContent>
        </Card>
    );

    if (!href) {
        return card;
    }

    return (
        <Link href={href} className="block h-full focus-visible:outline-none">
            {card}
        </Link>
    );
}
