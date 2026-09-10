<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;

trait BannerValidationRules
{
    /**
     * Normalize the is_active checkbox value before validation.
     *
     * Inertia submits multipart form data as strings, so "true"/"false" arrive
     * as strings which the boolean rule would otherwise reject.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * Get the validation rules used to validate banners.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string|object>>
     */
    protected function bannerRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,webp,gif', 'max:2048'],
            'link_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
