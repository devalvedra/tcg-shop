import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, Tags, Trash2 } from 'lucide-react';
import ProductCategoryController from '@/actions/App/Http/Controllers/Admin/ProductCategoryController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { catalog } from '@/routes';
import {
    edit as editCategory,
    index as categoriesIndex,
} from '@/routes/admin/categories';
import type { ProductCategory } from '@/types';

type Props = {
    category: ProductCategory;
    productCount: number;
};

export default function ShowCategory({ category, productCount }: Props) {
    return (
        <>
            <Head title={category.name} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
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

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                            <Tags className="size-6" />
                            {category.name}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            <span className="font-mono">{category.slug}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link
                                href={editCategory({
                                    product_category: category.id,
                                })}
                            >
                                <Pencil className="size-4" />
                                {t('Edit')}
                            </Link>
                        </Button>
                        <Form
                            {...ProductCategoryController.destroy.form({
                                product_category: category.id,
                            })}
                            onSubmit={(e) => {
                                if (
                                    !window.confirm(
                                        t(
                                            'Delete {name}? Products using this category will keep their current value.',
                                            {
                                                name: category.name,
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
                                variant="outline"
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                                <Trash2 className="size-4" />
                                {t('Delete')}
                            </Button>
                        </Form>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('Name')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{category.name}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('Slug')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-mono text-sm">{category.slug}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t('Products')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{productCount}</p>
                            <Link
                                href={catalog.url({
                                    query: { category: category.slug },
                                })}
                                className="mt-1 inline-block text-sm text-indigo-600 hover:underline"
                            >
                                {t('View in catalog')}
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

ShowCategory.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: categoriesIndex(),
        },
        {
            title: 'Category Details',
            href: categoriesIndex(),
        },
    ],
};
