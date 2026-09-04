<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string $category
 * @property-read string $category_name
 * @property string $price
 * @property string|null $sell_price
 * @property int $stock
 * @property string $status
 * @property Carbon|null $open_po_date
 * @property Carbon|null $close_po_date
 * @property-read Collection<int, ProductImage> $images
 */
#[Fillable(['name', 'description', 'category', 'price', 'sell_price', 'stock', 'status', 'open_po_date', 'close_po_date'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    /**
     * Perform any model initialization.
     */
    protected static function booted(): void
    {
        static::saving(function (Product $product) {
            if (empty($product->slug) || $product->isDirty('name')) {
                $product->slug = $product->generateSlug();
            }
        });
    }

    /**
     * Generate a URL-friendly slug from the product name.
     */
    public function generateSlug(): string
    {
        $base = Str::slug($this->name);
        $slug = $base;
        $i = 2;

        while (Product::query()
            ->where('slug', $slug)
            ->when($this->exists, fn ($query) => $query->whereKeyNot($this->id))
            ->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    public const string STATUS_READY = 'ready';

    public const string STATUS_PRE_ORDER = 'pre-order';

    public const string STATUS_UNAVAILABLE = 'unavailable';

    /**
     * @var array<string, string>
     */
    public const array STATUS_LABELS = [
        'ready' => 'Ready',
        'pre-order' => 'Pre-order',
        'unavailable' => 'Unavailable',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = ['category_name'];

    /**
     * Get the images belonging to this product.
     *
     * @return HasMany<ProductImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * Get the display name of the product's category.
     */
    public function getCategoryNameAttribute(): string
    {
        $name = ProductCategory::query()
            ->where('slug', $this->category)
            ->value('name');

        return $name !== null
            ? (string) $name
            : Str::headline(str_replace('-', ' ', $this->category));
    }

    /**
     * Determine whether the product is available for pre-order.
     */
    public function isPreOrder(): bool
    {
        return $this->status === self::STATUS_PRE_ORDER;
    }

    /**
     * Determine whether the pre-order window is currently open.
     */
    public function isPreOrderWindowOpen(?Carbon $now = null): bool
    {
        if ($this->status !== self::STATUS_PRE_ORDER || ! $this->open_po_date || ! $this->close_po_date) {
            return false;
        }

        return ($now ?? now())->between(
            $this->open_po_date->startOfDay(),
            $this->close_po_date->endOfDay(),
        );
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sell_price' => 'decimal:2',
            'stock' => 'integer',
            'open_po_date' => 'date:Y-m-d',
            'close_po_date' => 'date:Y-m-d',
        ];
    }
}
