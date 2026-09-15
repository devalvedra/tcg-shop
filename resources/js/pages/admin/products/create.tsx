import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, PackagePlus } from 'lucide-react';
import { ProductForm } from '@/components/product-form';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
    create as createProduct,
    index as productsIndex,
} from '@/routes/admin/products';

type Props = {
    categories: Record<string, string>;
    statuses: Record<string, string>;
    generalDescription?: string | null;
};

export default function CreateProduct({
    categories,
    statuses,
    generalDescription,
}: Props) {
    return (
        <>
            <Head title={t('Add Product')} />

            <div className="flex w-full max-w-none flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={productsIndex()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to products')}
                    </Link>
                </Button>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <PackagePlus className="size-6" />
                        {t('Add product')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                            'Add a new card, booster, or accessory to your catalog.',
                        )}
                    </p>
                </div>

                <ProductForm
                    categories={categories}
                    statuses={statuses}
                    generalDescription={generalDescription}
                />
            </div>
        </>
    );
}

CreateProduct.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: productsIndex(),
        },
        {
            title: 'Add Product',
            href: createProduct(),
        },
    ],
};
