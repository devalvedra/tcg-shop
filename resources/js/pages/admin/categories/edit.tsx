import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Tags } from 'lucide-react';
import { CategoryForm } from '@/components/category-form';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
    edit as editCategory,
    index as categoriesIndex,
    show as showCategory,
} from '@/routes/admin/categories';
import type { ProductCategory } from '@/types';

type Props = {
    category: ProductCategory;
};

export default function EditCategory({ category }: Props) {
    return (
        <>
            <Head title={t('Edit {name}', { name: category.name })} />

            <div className="flex w-full max-w-none flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link
                        href={showCategory({
                            product_category: category.id,
                        })}
                    >
                        <ArrowLeft className="size-4" />
                        {t('Back to category')}
                    </Link>
                </Button>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <Tags className="size-6" />
                        {t('Edit {name}', { name: category.name })}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('Update the name or slug of this category.')}
                    </p>
                </div>

                <CategoryForm category={category} />
            </div>
        </>
    );
}

EditCategory.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: categoriesIndex(),
        },
        {
            title: 'Edit Category',
            href: editCategory({ product_category: 1 }),
        },
    ],
};
