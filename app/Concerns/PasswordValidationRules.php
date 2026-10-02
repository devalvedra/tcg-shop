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
     * Get the strong password rules shared by registration and the admin
     * password change: at least 8 characters with lowercase, uppercase,
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
