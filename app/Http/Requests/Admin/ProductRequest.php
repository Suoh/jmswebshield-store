<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string'],
            'full_description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'discount' => ['nullable', 'integer', 'min:0', 'max:100'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'model' => ['nullable', 'string'],
            'image_url' => ['nullable', 'url'],
            'metadata' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'editor_image_ids' => ['nullable', 'array'],
            'editor_image_ids.*' => ['integer', 'exists:editor_images,id'],
            'product_image_ids' => ['nullable', 'array'],
            'product_image_ids.*' => ['integer', 'exists:product_images,id'],
        ];
    }
}
