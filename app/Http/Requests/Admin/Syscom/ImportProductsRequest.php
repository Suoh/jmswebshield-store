<?php

namespace App\Http\Requests\Admin\Syscom;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ImportProductsRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'products' => ['required', 'array', 'min:1', 'max:50'],
            'products.*.producto_id' => ['required', 'string'],
            'products.*.price' => ['required', 'numeric', 'min:0.01'],
        ];
    }
}
