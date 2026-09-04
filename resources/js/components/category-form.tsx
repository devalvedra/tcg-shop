import { Link, useForm } from '@inertiajs/react';
import { Tags } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import {
    index as categoriesIndex,
    show as showCategory,
    store,
    update,
} from '@/routes/admin/categories';
import type { ProductCategory } from '@/types';

type Props = {
    category?: ProductCategory;
};

type CategoryFormData = {
    name: string;
    slug: string;
};

export function CategoryForm({ category }: Props) {
    const isEdit = Boolean(category);

    const form = useForm<CategoryFormData>({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            form.put(update.url({ product_category: category!.id }));
        } else {
            form.post(store.url());
        }
    };

    return (
        <form onSubmit={submit} className="grid gap-6">
            <Card>
                <CardContent className="grid gap-4 pt-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                {t('Name')}{' '}
                                <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="Booster Boxes"
                                autoFocus
                                required
                                className="mt-1"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="slug">
                                {t('Slug')}{' '}
                                <span className="text-muted-foreground">
                                    {t('(optional)')}
                                </span>
                            </Label>
                            <Input
                                id="slug"
                                name="slug"
                                value={form.data.slug}
                                onChange={(e) =>
                                    form.setData(
                                        'slug',
                                        e.target.value.toLowerCase(),
                                    )
                                }
                                placeholder={t('auto-generated')}
                                className="mt-1 font-mono"
                            />
                            <InputError message={form.errors.slug} />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'The slug is used in catalog URLs and product filters. Leave it blank to generate one from the name.',
                        )}
                    </p>
                </CardContent>
            </Card>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={form.processing}>
                    <Tags className="size-4" />
                    {isEdit ? t('Update category') : t('Create category')}
                </Button>
                <Button asChild variant="ghost">
                    <Link
                        href={
                            isEdit
                                ? showCategory({
                                      product_category: category!.id,
                                  })
                                : categoriesIndex()
                        }
                    >
                        {t('Cancel')}
                    </Link>
                </Button>
            </div>
        </form>
    );
}
