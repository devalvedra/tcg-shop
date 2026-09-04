<?php

namespace App\Models;

use Database\Factories\PromoCodeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string|null $description
 * @property string $discount_type
 * @property string $discount_value
 * @property string $min_subtotal
 * @property string|null $max_discount
 * @property int|null $usage_limit
 * @property int $uses_count
 * @property Carbon|null $starts_at
 * @property Carbon|null $expires_at
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Order> $orders
 */
#[Fillable(['code', 'name', 'description', 'discount_type', 'discount_value', 'min_subtotal', 'max_discount', 'usage_limit', 'uses_count', 'starts_at', 'expires_at', 'is_active'])]
class PromoCode extends Model
{
    /** @use HasFactory<PromoCodeFactory> */
    use HasFactory;

    public const string DISCOUNT_TYPE_PERCENT = 'percent';

    public const string DISCOUNT_TYPE_FIXED = 'fixed';

    /**
     * @var array<int, string>
     */
    public const array DISCOUNT_TYPES = [
        self::DISCOUNT_TYPE_PERCENT,
        self::DISCOUNT_TYPE_FIXED,
    ];

    /**
     * @var array<string, string>
     */
    public const array DISCOUNT_TYPE_LABELS = [
        'percent' => 'Percent off',
        'fixed' => 'Fixed amount',
    ];

    /**
     * Whether this code is currently redeemable for the given subtotal.
     */
    public function isValidForSubtotal(float $subtotal): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ((float) $this->min_subtotal > $subtotal) {
            return false;
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->usage_limit !== null && $this->uses_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * The discount this code grants for the given subtotal.
     */
    public function discountFor(float $subtotal): float
    {
        if ($this->discount_type === self::DISCOUNT_TYPE_PERCENT) {
            $discount = $subtotal * ((float) $this->discount_value / 100);

            if ($this->max_discount !== null) {
                $discount = min($discount, (float) $this->max_discount);
            }

            return round($discount, 2);
        }

        return round(min((float) $this->discount_value, $subtotal), 2);
    }

    /**
     * The orders that used this code.
     *
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'min_subtotal' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
