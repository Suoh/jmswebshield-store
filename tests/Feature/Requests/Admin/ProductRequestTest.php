<?php

use App\Http\Requests\Admin\ProductRequest;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Validation\Rule;

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

    it('fails when sku is not unique on store', function () {
        Product::factory()->create(['sku' => 'LAP-001']);

        $rules = (new ProductRequest)->rules();

        $validator = validator(['name' => 'Laptop', 'price' => 100, 'sku' => 'LAP-001'], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('sku'))->toBeTrue();
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

    it('passes when updating product with same sku (unique ignores self)', function () {
        $product = Product::factory()->create(['sku' => 'LAP-001']);

        $validator = validator(
            ['name' => 'Laptop', 'price' => 100, 'sku' => 'LAP-001'],
            ['sku' => ['nullable', 'string', Rule::unique('products', 'sku')->ignore($product->id)]]
        );

        expect($validator->fails())->toBeFalse();
    });

    it('fails when updating product with another existing sku', function () {
        $product = Product::factory()->create(['sku' => 'LAP-001']);
        Product::factory()->create(['sku' => 'LAP-002']);

        $validator = validator(
            ['name' => 'Laptop', 'price' => 100, 'sku' => 'LAP-002'],
            ['sku' => ['nullable', 'string', Rule::unique('products', 'sku')->ignore($product->id)]]
        );

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('sku'))->toBeTrue();
    });
});
