<?php

use App\Models\Marca;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;

it('creates the marcas table with all expected columns', function () {
    expect(Schema::hasTable('marcas'))->toBeTrue();

    $columns = Schema::getColumnListing('marcas');

    expect($columns)->toContain(
        'id',
        'name',
        'slug',
        'created_at',
        'updated_at',
    );
});

it('can create a marca with fillable fields', function () {
    $marca = Marca::create([
        'name' => 'Test Brand',
        'slug' => 'test-brand',
    ]);

    expect($marca)->toBeInstanceOf(Marca::class)
        ->and($marca->name)->toBe('Test Brand')
        ->and($marca->slug)->toBe('test-brand');
});

it('has many products', function () {
    $marca = Marca::factory()->create();
    Product::factory()->count(3)->create(['marca_id' => $marca->id]);

    expect($marca->products)->toHaveCount(3)
        ->and($marca->products->first())->toBeInstanceOf(Product::class);
});

it('enforces unique name', function () {
    Marca::factory()->create(['name' => 'Unique Brand']);

    expect(fn () => Marca::factory()->create(['name' => 'Unique Brand']))
        ->toThrow(QueryException::class);
});

it('enforces unique slug', function () {
    Marca::factory()->create(['slug' => 'unique-slug']);

    expect(fn () => Marca::factory()->create(['slug' => 'unique-slug']))
        ->toThrow(QueryException::class);
});
