import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Tags } from 'lucide-react';
import { CategoryForm } from '@/components/category-form';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import {
    create as createCategory,
    index as categoriesIndex,
} from '@/routes/admin/categories';

export default function CreateCategory() {
    return (
        <>
            <Head title={t('Add Category')} />

            <div className="flex w-full max-w-none flex-col gap-6 p-4 md:p-6">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit text-muted-foreground"
                >
                    <Link href={categoriesIndex()}>
                        <ArrowLeft className="size-4" />
                        {t('Back to categories')}
                    </Link>
                </Button>

                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <Tags className="size-6" />
                        {t('Add category')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                            'Create a category customers can browse in the catalog.',
                        )}
                    </p>
                </div>

                <CategoryForm />
            </div>
        </>
    );
}

CreateCategory.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: categoriesIndex(),
        },
        {
            title: 'Add Category',
            href: createCategory(),
        },
    ],
};
