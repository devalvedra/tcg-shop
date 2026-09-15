<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $id
 * @property string $city_id
 * @property string $name
 * @property-read City $city
 * @property-read Collection<int, Subdistrict> $subdistricts
 */
#[Fillable(['id', 'city_id', 'name'])]
class District extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * The city this district belongs to.
     *
     * @return BelongsTo<City, $this>
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * The subdistricts that belong to this district.
     *
     * @return HasMany<Subdistrict, $this>
     */
    public function subdistricts(): HasMany
    {
        return $this->hasMany(Subdistrict::class);
    }
}
