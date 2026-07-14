<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BannerRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $banner = $this->route('banner');
        $bannerId = is_object($banner) ? $banner->id : $banner;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('banners', 'name')->ignore($bannerId),
            ],
            'image' => [
                Rule::when($bannerId === null, 'required'),
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
            'link_url' => ['nullable', 'url', 'max:2048'],
            'position' => ['nullable', 'integer', 'min:0', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
