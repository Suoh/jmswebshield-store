<?php

use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

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

it('cover_image accessor uses loaded images relation when available', function () {
    $product = Product::factory()->create([
        'image_url' => 'https://example.com/fallback.jpg',
    ]);

    ProductImage::factory()->create([
        'product_id' => $product->id,
        'is_cover' => true,
        'position' => 0,
        'path' => 'products/cover.jpg',
    ]);

    $product->load(['images']);

    expect($product->cover_image)->toBe(asset('storage/products/cover.jpg'));
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

it('deletes image files from disk on forceDelete', function () {
    Storage::fake('public');

    $product = Product::factory()->create();
    $img1 = ProductImage::factory()->create(['product_id' => $product->id, 'path' => 'products/img1.jpg']);
    $img2 = ProductImage::factory()->create(['product_id' => $product->id, 'path' => 'products/img2.jpg']);

    Storage::disk('public')->put($img1->path, 'fake-data');
    Storage::disk('public')->put($img2->path, 'fake-data');

    $product->forceDelete();

    Storage::disk('public')->assertMissing($img1->path);
    Storage::disk('public')->assertMissing($img2->path);
});

it('does not delete image files on soft delete', function () {
    Storage::fake('public');

    $product = Product::factory()->create();
    $img = ProductImage::factory()->create(['product_id' => $product->id, 'path' => 'products/soft-delete-test.jpg']);
    Storage::disk('public')->put($img->path, 'fake-data');

    $product->delete();

    expect($product->trashed())->toBeTrue();
    Storage::disk('public')->assertExists($img->path);
});

it('sanitizes full_description on create', function () {
    $product = Product::create([
        'name' => 'XSS Product',
        'full_description' => '<p>Safe</p><script>alert("xss")</script><p>Text</p>',
        'price' => 99.99,
    ]);

    expect($product->full_description)
        ->toContain('<p>Safe</p>')
        ->toContain('<p>Text</p>')
        ->not->toContain('<script>');
});

it('sanitizes full_description on update', function () {
    $product = Product::factory()->create([
        'full_description' => '<p>Original</p>',
    ]);

    $product->update([
        'full_description' => '<b>Bold</b><iframe src="evil"></iframe>',
        'name' => $product->name,
        'price' => $product->price,
    ]);

    expect($product->fresh()->full_description)
        ->toContain('<b>Bold</b>')
        ->not->toContain('<iframe>');
});

it('sets full_description to null when sanitized result is empty', function () {
    $product = Product::create([
        'name' => 'Empty HTML',
        'full_description' => '<script>only script</script>',
        'price' => 99.99,
    ]);

    expect($product->full_description)->toBeNull();
});

it('keeps full_description unchanged when null', function () {
    $product = Product::factory()->create([
        'full_description' => null,
    ]);

    expect($product->full_description)->toBeNull();
});
