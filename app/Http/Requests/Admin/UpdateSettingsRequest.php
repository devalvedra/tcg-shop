<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'store_name' => ['nullable', 'string', 'max:255'],
            'store_email' => ['nullable', 'email', 'max:255'],
            'store_phone' => ['nullable', 'string', 'max:50'],
            'store_address' => ['nullable', 'string', 'max:500'],
            'store_logo' => ['nullable', 'image', 'mimes:jpeg,png,webp,svg', 'max:2048'],
            'customer_verification' => ['sometimes', 'boolean'],
            'cancel_order_enabled' => ['sometimes', 'boolean'],
            'cancel_order_hours' => ['sometimes', 'integer', 'min:0', 'max:720'],
            'general_description' => ['nullable', 'string', 'max:20000'],
            'whatsapp_number' => ['nullable', 'string', 'max:50'],
            'shipping_fee' => ['required', 'numeric', 'min:0'],
            'free_shipping_threshold' => ['required', 'numeric', 'min:0'],
            'locale' => ['required', 'string', Rule::in(['en', 'id'])],
            'currency' => ['required', 'string', Rule::in(['usd', 'idr'])],
        ];
    }
}
