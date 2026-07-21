<?php

use App\Http\Requests\Admin\Syscom\ImportBrandsRequest;

beforeEach(fn () => actingAsAdmin());

describe('ImportBrandsRequest', function () {
    it('passes with a valid brands array', function () {
        $rules = (new ImportBrandsRequest)->rules();

        $validator = validator([
            'brands' => [
                ['syscom_id' => '123', 'name' => 'Brand A'],
                ['syscom_id' => '456', 'name' => 'Brand B'],
            ],
        ], $rules);

        expect($validator->fails())->toBeFalse();
    });

    it('fails when brands is missing', function () {
        $rules = (new ImportBrandsRequest)->rules();

        $validator = validator([], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('brands'))->toBeTrue();
    });

    it('fails when brands is empty', function () {
        $rules = (new ImportBrandsRequest)->rules();

        $validator = validator(['brands' => []], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('brands'))->toBeTrue();
    });

    it('fails when brands array has more than 50 items', function () {
        $rules = (new ImportBrandsRequest)->rules();

        $brands = array_fill(0, 51, ['syscom_id' => 'x', 'name' => 'B']);

        $validator = validator(['brands' => $brands], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('brands'))->toBeTrue();
    });

    it('fails when a brand item is missing syscom_id', function () {
        $rules = (new ImportBrandsRequest)->rules();

        $validator = validator([
            'brands' => [
                ['name' => 'Brand A'],
            ],
        ], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('brands.0.syscom_id'))->toBeTrue();
    });

    it('fails when a brand item is missing name', function () {
        $rules = (new ImportBrandsRequest)->rules();

        $validator = validator([
            'brands' => [
                ['syscom_id' => '123'],
            ],
        ], $rules);

        expect($validator->fails())->toBeTrue()
            ->and($validator->errors()->has('brands.0.name'))->toBeTrue();
    });
});
