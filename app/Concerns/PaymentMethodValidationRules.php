<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait PaymentMethodValidationRules
{
    /**
     * Normalize the payment method before validation.
     *
     * Empty optional values are sent as null.
     */
    protected function prepareForValidation(): void
    {
        foreach (['description', 'instructions'] as $field) {
            if ($this->input($field) === '') {
                $this->merge([$field => null]);
            }
        }

        if ($this->input('sort_order') === '' || $this->input('sort_order') === null) {
            $this->merge(['sort_order' => 0]);
        }

        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * Get the validation rules used to validate payment methods.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string|object>>
     */
    protected function paymentMethodRules(?int $ignoreId = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('payment_methods', 'code')->ignore($ignoreId),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'instructions' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
