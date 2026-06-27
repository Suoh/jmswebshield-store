<?php

namespace App\Http\Requests\Admin\Syscom;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ImportBrandsRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'brands' => ['required', 'array', 'min:1', 'max:50'],
            'brands.*.syscom_id' => ['required', 'string'],
            'brands.*.name' => ['required', 'string'],
        ];
    }
}
