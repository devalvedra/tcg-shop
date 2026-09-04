import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Package } from 'lucide-react';
import { ProductForm } from '@/components/product-form';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
    index as productsIndex,
    show as showProduct,
} from '@/routes/admin/products';
import type { Product } from '@/types';

type Props = {
    product: Product;
    categories: Record<string, string>;
    statuses: Record<string, string>;
};

export default function EditProduct({ product, categories, statuses }: Props) {
    return (
        <>
            <Head title={t('Edit {name}', { name: product.name })} />

            <div className="flex w-full max-w-none flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={showProduct({ product: product.id })}>
                        <ArrowLeft className="size-4" />
                        {t('Back to product')}
                    </Link>
                </Button>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <Package className="size-6" />
                        {t('Edit {name}', { name: product.name })}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                            'Update the product details, pricing, stock, and images.',
                        )}
                    </p>
                </div>

                <ProductForm
                    product={product}
                    categories={categories}
                    statuses={statuses}
                />
            </div>
        </>
    );
}

EditProduct.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: productsIndex(),
        },
        {
            title: 'Edit Product',
            href: productsIndex(),
        },
    ],
};
