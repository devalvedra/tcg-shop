<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait CustomerValidationRules
{
    /**
     * Get the validation rules used to validate customer accounts.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function customerRules(?User $customer = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => [
                'required',
                'string',
                'max:255',
                $customer === null
                    ? Rule::unique(User::class)
                    : Rule::unique(User::class)->ignore($customer),
            ],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                $customer === null
                    ? Rule::unique(User::class)
                    : Rule::unique(User::class)->ignore($customer),
            ],
        ];
    }
}
