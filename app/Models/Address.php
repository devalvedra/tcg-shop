<?php

namespace App\Models;

use Database\Factories\AddressFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $receiver_name
 * @property string $address
 * @property string $city
 * @property string|null $province
 * @property string|null $district
 * @property string|null $subdistrict
 * @property string|null $zip
 * @property bool $is_default
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 */
#[Fillable(['user_id', 'receiver_name', 'address', 'city', 'province', 'district', 'subdistrict', 'zip', 'is_default'])]
class Address extends Model
{
    /** @use HasFactory<AddressFactory> */
    use HasFactory;

    /**
     * The customer who owns this address.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get a one-line label for the address.
     */
    public function getLabelAttribute(): string
    {
        return collect([
            $this->address,
            $this->subdistrict,
            $this->district,
            $this->city,
            $this->province,
            $this->zip,
        ])
            ->filter()
            ->join(', ');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }
}
