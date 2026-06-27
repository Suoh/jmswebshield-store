<?php

use App\Http\Requests\Admin\BrandRequest;
use App\Models\Brand;
use Illuminate\Validation\Rule;

beforeEach(fn () => actingAsAdmin());

describe('BrandRequest', function () {
    it('passes validation with a valid name on store', function () {
        $rules = (new BrandRequest)->rules();

        $validator = validator(['name' => 'Samsung'], $rules);

        expect($validator->fails())->toBeFalse();
    });

    it('fails when name is missing', function () {
        $rules = (new BrandRequest)->rules();

        $validator = validator([], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('name'))->toBeTrue();
    });

    it('fails when name exceeds 255 characters', function () {
        $rules = (new BrandRequest)->rules();

        $validator = validator(['name' => str_repeat('a', 256)], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('name'))->toBeTrue();
    });

    it('fails when name is already taken on store', function () {
        Brand::factory()->create(['name' => 'Samsung']);

        $rules = (new BrandRequest)->rules();

        $validator = validator(['name' => 'Samsung'], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('name'))->toBeTrue();
    });

    it('passes when updating a brand with the same name (unique ignores self)', function () {
        $brand = Brand::factory()->create(['name' => 'Samsung']);

        $validator = validator(
            ['name' => 'Samsung'],
            ['name' => ['required', 'string', 'max:255', Rule::unique('brands', 'name')->ignore($brand->id)]]
        );

        expect($validator->fails())->toBeFalse();
    });

    it('fails when updating a brand with another existing name', function () {
        $brand = Brand::factory()->create(['name' => 'Samsung']);
        Brand::factory()->create(['name' => 'LG']);

        $validator = validator(
            ['name' => 'LG'],
            ['name' => ['required', 'string', 'max:255', Rule::unique('brands', 'name')->ignore($brand->id)]]
        );

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('name'))->toBeTrue();
    });
});
