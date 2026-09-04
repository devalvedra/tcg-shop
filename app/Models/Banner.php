<?php

namespace App\Models;

use Database\Factories\BannerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $title
 * @property string|null $subtitle
 * @property string|null $image
 * @property string|null $link_url
 * @property int $sort_order
 * @property bool $is_active
 * @property-read string|null $url
 */
#[Fillable(['title', 'subtitle', 'image', 'link_url', 'sort_order', 'is_active'])]
class Banner extends Model
{
    /** @use HasFactory<BannerFactory> */
    use HasFactory;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = ['url'];

    /**
     * Get the public URL of the banner image.
     */
    public function getUrlAttribute(): ?string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : null;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
