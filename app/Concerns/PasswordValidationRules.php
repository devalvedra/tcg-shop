<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rules\Password;

trait PasswordValidationRules
{
    /**
     * Get the validation rules used to validate passwords.
     *
     * @return array<int, Password|ValidationRule|array<mixed>|string>
     */
    protected function passwordRules(): array
    {
        return ['required', 'string', Password::default(), 'confirmed'];
    }

    /**
     * Get the validation rules used to validate the current password.
     *
     * @return array<int, Password|ValidationRule|array<mixed>|string>
     */
    protected function currentPasswordRules(): array
    {
        return ['required', 'string', 'current_password'];
    }

    /**
     * Get the relaxed password rules used for customer-facing passwords:
     * any characters, at least four of them.
     *
     * @return array<int, string>
     */
    protected function minimumPasswordRules(): array
    {
        return ['required', 'string', 'min:4', 'confirmed'];
    }

    /**
     * Get the validation message for the relaxed password rules.
     *
     * @return array<string, string>
     */
    protected function minimumPasswordMessages(): array
    {
        return ['password.min' => __('shop.password_min')];
    }

    /**
     * Get the strong password rules used for the administrator's own
     * password: at least 8 characters with lowercase, uppercase,
     * numbers, and symbols, enforced by a single expression so failures
     * produce one message instead of one per character class.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function strongPasswordRules(): array
    {
        return [
            'required',
            'string',
            'confirmed',
            'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/',
        ];
    }

    /**
     * Get the single validation message for the strong password rules.
     *
     * @return array<string, string>
     */
    protected function strongPasswordMessages(): array
    {
        return ['password.regex' => __('shop.password_requirements')];
    }
}
