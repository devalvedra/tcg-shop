<?php

namespace App\Http\Requests\Admin;

use App\Concerns\PromoCodeValidationRules;
use App\Models\PromoCode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePromoCodeRequest extends FormRequest
{
    use PromoCodeValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $promoCode = $this->route('promo_code');

        return $this->promoCodeRules($promoCode instanceof PromoCode ? $promoCode->id : null);
    }
}
