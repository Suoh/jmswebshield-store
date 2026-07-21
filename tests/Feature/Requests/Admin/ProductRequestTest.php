<?php

use App\Http\Requests\Admin\ProductRequest;
use App\Models\Brand;
use App\Models\Category;

beforeEach(fn () => actingAsAdmin());

describe('ProductRequest', function () {
    it('passes validation with a valid product on store', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator([
            'name' => 'Laptop',
            'price' => 999.99,
            'stock' => 10,
        ], $rules);

        expect($validator->fails())->toBeFalse();
    });

    it('fails when name is missing', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator(['price' => 100], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('name'))->toBeTrue();
    });

    it('fails when price is missing', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator(['name' => 'Laptop'], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('price'))->toBeTrue();
    });

    it('fails when price is negative', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator(['name' => 'Laptop', 'price' => -1], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('price'))->toBeTrue();
    });

    it('fails when stock is negative', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator(['name' => 'Laptop', 'price' => 10, 'stock' => -5], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('stock'))->toBeTrue();
    });

    it('fails when discount exceeds 100', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator(['name' => 'Laptop', 'price' => 10, 'discount' => 101], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('discount'))->toBeTrue();
    });

    it('fails when discount is negative', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator(['name' => 'Laptop', 'price' => 10, 'discount' => -1], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('discount'))->toBeTrue();
    });

    it('fails when brand_id does not exist', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator(['name' => 'Laptop', 'price' => 100, 'brand_id' => 99999], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('brand_id'))->toBeTrue();
    });

    it('passes when brand_id exists', function () {
        $brand = Brand::factory()->create();

        $rules = (new ProductRequest)->rules();

        $validator = validator([
            'name' => 'Laptop',
            'price' => 100,
            'brand_id' => $brand->id,
        ], $rules);

        expect($validator->fails())->toBeFalse();
    });

    it('fails when image_url is not a valid URL', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator(['name' => 'Laptop', 'price' => 100, 'image_url' => 'not-a-url'], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('image_url'))->toBeTrue();
    });

    it('passes when category_ids is empty', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator([
            'name' => 'Laptop',
            'price' => 100,
            'category_ids' => [],
        ], $rules);

        expect($validator->fails())->toBeFalse();
    });

    it('passes when category_ids contain valid category ids', function () {
        $category = Category::factory()->create();

        $rules = (new ProductRequest)->rules();

        $validator = validator([
            'name' => 'Laptop',
            'price' => 100,
            'category_ids' => [$category->id],
        ], $rules);

        expect($validator->fails())->toBeFalse();
    });

    it('fails when category_ids contain nonexistent id', function () {
        $rules = (new ProductRequest)->rules();

        $validator = validator([
            'name' => 'Laptop',
            'price' => 100,
            'category_ids' => [99999],
        ], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('category_ids.0'))->toBeTrue();
    });
});
