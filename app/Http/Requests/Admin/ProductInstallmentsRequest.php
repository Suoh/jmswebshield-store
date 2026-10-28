<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductInstallmentsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'product_ids' => ['required', 'array', 'min:1'],
            'product_ids.*' => ['required', 'integer', 'distinct', Rule::exists('products', 'id')->whereNull('deleted_at')],
            'msi_3_months' => ['required', 'boolean'],
            'msi_6_months' => ['required', 'boolean'],
        ];
    }
}
