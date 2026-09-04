<?php

namespace App\Models;

use Database\Factories\ProductCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property-read Collection<int, Product> $products
 */
#[Fillable(['name', 'slug'])]
class ProductCategory extends Model
{
    /** @use HasFactory<ProductCategoryFactory> */
    use HasFactory;

    /**
     * Perform any model initialization.
     */
    protected static function booted(): void
    {
        static::saving(function (ProductCategory $category) {
            if (empty($category->slug)) {
                $category->slug = $category->generateSlug();
            }
        });
    }

    /**
     * Generate a URL-friendly slug from the category name.
     */
    public function generateSlug(): string
    {
        $base = Str::slug($this->name);
        $slug = $base;
        $i = 2;

        while (ProductCategory::query()
            ->where('slug', $slug)
            ->when($this->exists, fn ($query) => $query->whereKeyNot($this->id))
            ->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    /**
     * The products that belong to this category.
     *
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category', 'slug');
    }

    /**
     * Get every category as a slug => name lookup, ordered by name.
     *
     * @return array<string, string>
     */
    public static function options(): array
    {
        return static::query()
            ->orderBy('name')
            ->pluck('name', 'slug')
            ->all();
    }
}
