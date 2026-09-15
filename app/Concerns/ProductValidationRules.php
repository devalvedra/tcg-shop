<?php

namespace App\Concerns;

use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProductValidationRules
{
    /**
     * Normalize optional numeric fields before validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->input('down_payment') === null || $this->input('down_payment') === '') {
            $this->merge(['down_payment' => 0]);
        }
    }

    /**
     * Get the validation rules used to validate products.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string|object>>
     */
    protected function productRules(?Product $product = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'youtube_link' => ['nullable', 'string', 'max:500', 'url'],
            'category' => ['required', Rule::exists('product_categories', 'slug')],
            'price' => ['required', 'numeric', 'min:0'],
            'sell_price' => [
                'nullable',
                'numeric',
                'min:0',
                Rule::when(fn () => filled($this->input('sell_price')), 'lte:price'),
            ],
            'down_payment' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'status' => ['required', Rule::in(array_keys(Product::STATUS_LABELS))],
            'open_po_date' => [
                Rule::requiredIf(fn () => $this->input('status') === Product::STATUS_PRE_ORDER),
                'nullable',
                'date',
            ],
            'close_po_date' => [
                Rule::requiredIf(fn () => $this->input('status') === Product::STATUS_PRE_ORDER),
                'nullable',
                'date',
                Rule::when(fn () => filled($this->input('open_po_date')), 'after:open_po_date'),
            ],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,png,webp,gif', 'max:2048'],
            'image_order' => ['nullable', 'array'],
            'image_order.*' => ['string'],
            'delete_images' => ['nullable', 'array'],
            'delete_images.*' => ['integer', 'exists:product_images,id'],
        ];
    }
}
