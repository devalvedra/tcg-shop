<?php

namespace App\Http\Requests\Admin;

use App\Concerns\PaymentMethodValidationRules;
use App\Models\PaymentMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentMethodRequest extends FormRequest
{
    use PaymentMethodValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $paymentMethod = $this->route('payment_method');

        return $this->paymentMethodRules($paymentMethod instanceof PaymentMethod ? $paymentMethod->id : null);
    }
}
