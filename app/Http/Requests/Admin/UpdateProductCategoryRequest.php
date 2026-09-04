<?php

namespace App\Http\Requests\Admin;

use App\Concerns\ProductCategoryValidationRules;
use App\Models\ProductCategory;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductCategoryRequest extends FormRequest
{
    use ProductCategoryValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $category = $this->route('product_category');

        return $this->productCategoryRules($category instanceof ProductCategory ? $category->id : null);
    }
}
