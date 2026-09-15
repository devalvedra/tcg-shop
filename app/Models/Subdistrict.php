<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $district_id
 * @property string $name
 * @property-read District $district
 */
#[Fillable(['id', 'district_id', 'name'])]
class Subdistrict extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * The district this subdistrict belongs to.
     *
     * @return BelongsTo<District, $this>
     */
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }
}
