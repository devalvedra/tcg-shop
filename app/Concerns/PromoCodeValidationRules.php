<?php

namespace App\Concerns;

use App\Models\PromoCode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait PromoCodeValidationRules
{
    /**
     * Normalize the promo code before validation.
     *
     * Codes are stored uppercase and empty optional values are sent as null.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper((string) preg_replace('/\s+/', '', $this->input('code') ?? '')),
        ]);

        if ($this->input('min_subtotal') === '' || $this->input('min_subtotal') === null) {
            $this->merge(['min_subtotal' => 0]);
        }

        foreach (['max_discount', 'usage_limit', 'starts_at', 'expires_at'] as $field) {
            if ($this->input($field) === '' || $this->input($field) === null) {
                $this->merge([$field => null]);
            }
        }

        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * Get the validation rules used to validate promo codes.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string|object>>
     */
    protected function promoCodeRules(?int $ignoreId = null): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:50',
                'regex:/^[A-Z0-9-]+$/',
                Rule::unique('promo_codes', 'code')->ignore($ignoreId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'discount_type' => ['required', Rule::in(PromoCode::DISCOUNT_TYPES)],
            'discount_value' => [
                'required',
                'numeric',
                'min:0.01',
                $this->input('discount_type') === PromoCode::DISCOUNT_TYPE_PERCENT ? 'max:100' : 'max:100000',
            ],
            'min_subtotal' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
