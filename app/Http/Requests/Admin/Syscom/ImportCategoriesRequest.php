<?php

namespace App\Http\Requests\Admin\Syscom;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ImportCategoriesRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'categories' => ['required', 'array', 'min:1', 'max:50'],
            'categories.*.syscom_id' => ['required', 'string'],
            'categories.*.name' => ['required', 'string'],
        ];
    }
}
