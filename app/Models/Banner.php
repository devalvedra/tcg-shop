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
 * @property string|null $image_mobile
 * @property string|null $link_url
 * @property int $sort_order
 * @property bool $is_active
 * @property-read string|null $url
 * @property-read string|null $mobile_url
 */
#[Fillable(['title', 'subtitle', 'image', 'image_mobile', 'link_url', 'sort_order', 'is_active'])]
class Banner extends Model
{
    /** @use HasFactory<BannerFactory> */
    use HasFactory;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = ['url', 'mobile_url'];

    /**
     * Get the public URL of the desktop banner image.
     */
    public function getUrlAttribute(): ?string
    {
        return $this->image ? Storage::disk('public')->url($this->image) : null;
    }

    /**
     * Get the public URL of the mobile banner image.
     */
    public function getMobileUrlAttribute(): ?string
    {
        return $this->image_mobile ? Storage::disk('public')->url($this->image_mobile) : null;
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
