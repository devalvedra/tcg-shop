<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $id
 * @property string $name
 * @property-read Collection<int, City> $cities
 */
#[Fillable(['id', 'name'])]
class Province extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * The cities that belong to this province.
     *
     * @return HasMany<City, $this>
     */
    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
