<?php

use App\Http\Requests\Admin\Syscom\ImportProductsRequest;

beforeEach(fn () => actingAsAdmin());

describe('ImportProductsRequest', function () {
    it('passes with a valid products array', function () {
        $rules = (new ImportProductsRequest)->rules();

        $validator = validator([
            'products' => [
                ['producto_id' => '123', 'price' => 99.99],
                ['producto_id' => '456', 'price' => 149.50],
            ],
        ], $rules);

        expect($validator->fails())->toBeFalse();
    });

    it('fails when products is missing', function () {
        $rules = (new ImportProductsRequest)->rules();

        $validator = validator([], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('products'))->toBeTrue();
    });

    it('fails when products is empty', function () {
        $rules = (new ImportProductsRequest)->rules();

        $validator = validator(['products' => []], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('products'))->toBeTrue();
    });

    it('fails when products array has more than 50 items', function () {
        $rules = (new ImportProductsRequest)->rules();

        $products = array_fill(0, 51, ['producto_id' => 'x', 'price' => 10]);

        $validator = validator(['products' => $products], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('products'))->toBeTrue();
    });

    it('fails when a product item is missing producto_id', function () {
        $rules = (new ImportProductsRequest)->rules();

        $validator = validator([
            'products' => [
                ['price' => 99.99],
            ],
        ], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('products.0.producto_id'))->toBeTrue();
    });

    it('fails when a product price is missing', function () {
        $rules = (new ImportProductsRequest)->rules();

        $validator = validator([
            'products' => [
                ['producto_id' => '123'],
            ],
        ], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('products.0.price'))->toBeTrue();
    });

    it('fails when a product price is below 0.01', function () {
        $rules = (new ImportProductsRequest)->rules();

        $validator = validator([
            'products' => [
                ['producto_id' => '123', 'price' => 0],
            ],
        ], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('products.0.price'))->toBeTrue();
    });
});
