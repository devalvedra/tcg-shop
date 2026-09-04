<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;

trait AddressValidationRules
{
    /**
     * Normalize the is_default checkbox before validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('is_default')) {
            $this->merge([
                'is_default' => filter_var($this->input('is_default'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * Get the validation rules used to validate shipping addresses.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function addressRules(): array
    {
        return [
            'receiver_name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'zip' => ['nullable', 'string', 'max:20'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
