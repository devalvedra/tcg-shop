<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $product_id
 * @property string $image
 * @property int $sort_order
 * @property-read string|null $url
 */
#[Fillable(['product_id', 'image', 'sort_order'])]
class ProductImage extends Model
{
    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = ['url'];

    /**
     * Get the product that owns the image.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the public URL of the image.
     */
    public function getUrlAttribute(): ?string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : null;
    }
}
