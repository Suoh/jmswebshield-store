<?php

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;

it('creates the brands table with all expected columns', function () {
    expect(Schema::hasTable('brands'))->toBeTrue();

    $columns = Schema::getColumnListing('brands');

    expect($columns)->toContain(
        'id',
        'name',
        'slug',
        'created_at',
        'updated_at',
    );
});

it('can create a brand with fillable fields', function () {
    $brand = Brand::create([
        'name' => 'Test Brand',
        'slug' => 'test-brand',
    ]);

    expect($brand)->toBeInstanceOf(Brand::class)
        ->and($brand->name)->toBe('Test Brand')
        ->and($brand->slug)->toBe('test-brand');
});

it('has many products', function () {
    $brand = Brand::factory()->create();
    Product::factory()->count(3)->create(['brand_id' => $brand->id]);

    expect($brand->products)->toHaveCount(3)
        ->and($brand->products->first())->toBeInstanceOf(Product::class);
});

it('enforces unique name', function () {
    Brand::factory()->create(['name' => 'Unique Brand']);

    expect(fn () => Brand::factory()->create(['name' => 'Unique Brand']))
        ->toThrow(QueryException::class);
});

it('enforces unique slug', function () {
    Brand::factory()->create(['slug' => 'unique-slug']);

    expect(fn () => Brand::factory()->create(['slug' => 'unique-slug']))
        ->toThrow(QueryException::class);
});
