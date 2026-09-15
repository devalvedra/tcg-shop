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
        if ($this->input('account_name') === '') {
            $this->merge(['account_name' => null]);
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
            'account_name' => ['nullable', 'string', 'max:255'],
            'code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('payment_methods', 'code')->ignore($ignoreId),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
