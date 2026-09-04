<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProductCategoryValidationRules
{
    /**
     * Get the validation rules used to validate product categories.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string|object>>
     */
    protected function productCategoryRules(?int $ignoreId = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('product_categories', 'name')->ignore($ignoreId)],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('product_categories', 'slug')->ignore($ignoreId),
            ],
        ];
    }
}
