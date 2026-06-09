<?php

use App\Models\Brand;
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
        'brand_id',
        'model',
        'metadata',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at',
    );
});

it('can create a product with all fillable fields', function () {
    $brand = Brand::factory()->create();

    $product = Product::create([
        'name' => 'Test Product',
        'short_description' => 'Short desc',
        'full_description' => 'Full description here',
        'stock' => 10,
        'price' => 99.99,
        'discount' => 20,
        'image_url' => 'https://example.com/image.jpg',
        'brand_id' => $brand->id,
        'model' => 'Model X',
        'metadata' => ['key' => 'value'],
        'is_active' => true,
    ]);

    expect($product)->toBeInstanceOf(Product::class)
        ->and($product->name)->toBe('Test Product')
        ->and($product->stock)->toBe(10)
        ->and($product->price)->toBe('99.99')
        ->and($product->discount)->toBe(20)
        ->and($product->metadata)->toBe(['key' => 'value'])
        ->and($product->is_active)->toBeTrue();
});

it('belongs to a brand', function () {
    $brand = Brand::factory()->create();
    $product = Product::factory()->create(['brand_id' => $brand->id]);

    expect($product->brand)->toBeInstanceOf(Brand::class)
        ->and($product->brand->id)->toBe($brand->id);
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

it('includes accessors in array output', function () {
    $product = Product::factory()->create([
        'image_url' => 'https://example.com/photo.jpg',
        'stock' => 5,
        'price' => 100,
        'discount' => 10,
    ]);

    $array = $product->toArray();

    expect($array)->toHaveKey('cover_image')
        ->and($array['cover_image'])->toBe('https://example.com/photo.jpg')
        ->and($array)->toHaveKey('availability')
        ->and($array['availability'])->toBe('Disponible')
        ->and($array)->toHaveKey('discounted_price');
});

it('casts attributes correctly', function () {
    $product = Product::factory()->create([
        'price' => 99.99,
        'discount' => 15,
        'metadata' => ['color' => 'red', 'size' => 'L'],
        'is_active' => true,
        'stock' => 42,
    ]);

    expect($product->price)->toBeString()
        ->and($product->discount)->toBeInt()
        ->and($product->metadata)->toBeArray()
        ->and($product->is_active)->toBeBool()
        ->and($product->stock)->toBeInt();
});
