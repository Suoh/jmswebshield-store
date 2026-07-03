<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * Single FormRequest handles both store and update. On update, the
     * route parameter 'product' is bound; the unique rule on 'sku'
     * ignores it.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('product');
        $productId = is_object($product) ? $product->id : $product;

        return [
            'name' => ['required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string'],
            'full_description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'discount' => ['nullable', 'integer', 'min:0', 'max:100'],
            'sku' => [
                'nullable',
                'string',
                Rule::unique('products', 'sku')->ignore($productId),
            ],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'model' => ['nullable', 'string'],
            'image_url' => ['nullable', 'url'],
            'metadata' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'editor_image_ids' => ['nullable', 'array'],
            'editor_image_ids.*' => ['integer', 'exists:editor_images,id'],
        ];
    }
}
