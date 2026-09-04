<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $key
 * @property string|null $value
 */
#[Fillable(['key', 'value'])]
class ShopSetting extends Model
{
    protected $table = 'settings';

    /**
     * Get all settings as a key => value lookup.
     *
     * @return array<string, string|null>
     */
    public static function allSettings(): array
    {
        return static::query()->pluck('value', 'key')->all();
    }

    /**
     * Get a single setting value, falling back to the given default.
     */
    public static function get(string $key, ?string $default = null): ?string
    {
        return static::query()->where('key', $key)->value('value') ?? $default;
    }

    /**
     * Upsert the given key => value pairs.
     *
     * @param  array<string, string|null>  $values
     */
    public static function setMany(array $values): void
    {
        foreach ($values as $key => $value) {
            static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
