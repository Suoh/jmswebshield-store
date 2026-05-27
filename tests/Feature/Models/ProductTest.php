<?php

use App\Models\Marca;
use App\Models\Product;
use Illuminate\Support\Facades\Schema;

it('creates the products table with all expected columns', function () {
    expect(Schema::hasTable('products'))->toBeTrue();

    $columns = Schema::getColumnListing('products');

    expect($columns)->toContain(
        'id',
        'name',
        'short_description',
        'full_description',
        'stock',
        'price',
        'discount',
        'image_url',
        'marca_id',
        'model',
        'extra_data',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at',
    );
});

it('can create a product with all fillable fields', function () {
    $marca = Marca::factory()->create();

    $product = Product::create([
        'name' => 'Test Product',
        'short_description' => 'Short desc',
        'full_description' => 'Full description here',
        'stock' => 10,
        'price' => 99.99,
        'discount' => 20,
        'image_url' => 'https://example.com/image.jpg',
        'marca_id' => $marca->id,
        'model' => 'Model X',
        'extra_data' => ['key' => 'value'],
        'is_active' => true,
    ]);

    expect($product)->toBeInstanceOf(Product::class)
        ->and($product->name)->toBe('Test Product')
        ->and($product->stock)->toBe(10)
        ->and($product->price)->toBe('99.99')
        ->and($product->discount)->toBe(20)
        ->and($product->extra_data)->toBe(['key' => 'value'])
        ->and($product->is_active)->toBeTrue();
});

it('belongs to a marca', function () {
    $marca = Marca::factory()->create();
    $product = Product::factory()->create(['marca_id' => $marca->id]);

    expect($product->marca)->toBeInstanceOf(Marca::class)
        ->and($product->marca->id)->toBe($marca->id);
});

it('returns correct availability based on stock', function () {
    $inStock = Product::factory()->create(['stock' => 5]);
    $outOfStock = Product::factory()->create(['stock' => 0]);

    expect($inStock->availability)->toBe('Disponible')
        ->and($outOfStock->availability)->toBe('Agotado');
});

it('calculates discounted price correctly', function () {
    $withDiscount = Product::factory()->create([
        'price' => 100.00,
        'discount' => 25,
    ]);

    $withoutDiscount = Product::factory()->create([
        'price' => 100.00,
        'discount' => 0,
    ]);

    expect($withDiscount->discounted_price)->toBe('75.00')
        ->and($withoutDiscount->discounted_price)->toBeNull();
});

it('returns image_url as cover image when no uploaded images exist', function () {
    $product = Product::factory()->create([
        'image_url' => 'https://example.com/fallback.jpg',
    ]);

    expect($product->cover_image)->toBe('https://example.com/fallback.jpg');
});

it('supports soft deletes', function () {
    $product = Product::factory()->create();
    $product->delete();

    expect($product->trashed())->toBeTrue()
        ->and(Product::count())->toBe(0)
        ->and(Product::withTrashed()->count())->toBe(1);
});

it('casts attributes correctly', function () {
    $product = Product::factory()->create([
        'price' => 99.99,
        'discount' => 15,
        'extra_data' => ['color' => 'red', 'size' => 'L'],
        'is_active' => true,
        'stock' => 42,
    ]);

    expect($product->price)->toBeString()
        ->and($product->discount)->toBeInt()
        ->and($product->extra_data)->toBeArray()
        ->and($product->is_active)->toBeBool()
        ->and($product->stock)->toBeInt();
});
