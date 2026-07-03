<?php

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpKernel\Exception\HttpException;

it('creates the categories table with all expected columns', function () {
    expect(Schema::hasTable('categories'))->toBeTrue();

    $columns = Schema::getColumnListing('categories');

    expect($columns)->toContain(
        'id',
        'name',
        'slug',
        'metadata',
        'created_at',
        'updated_at',
    );
});

it('can create a category with fillable fields', function () {
    $category = Category::create([
        'name' => 'Cámaras',
        'slug' => 'camaras',
    ]);

    expect($category)->toBeInstanceOf(Category::class)
        ->and($category->name)->toBe('Cámaras')
        ->and($category->slug)->toBe('camaras');
});

it('belongs to many products', function () {
    $category = Category::factory()->create();
    $products = Product::factory()->count(3)->create();

    $category->products()->attach($products->pluck('id'));

    expect($category->products)->toHaveCount(3)
        ->and($category->products->first())->toBeInstanceOf(Product::class);
});

it('can sync products via pivot', function () {
    $category = Category::factory()->create();
    $product1 = Product::factory()->create();
    $product2 = Product::factory()->create();

    $category->products()->sync([$product1->id, $product2->id]);

    expect($category->products)->toHaveCount(2);
});

it('enforces unique name', function () {
    Category::factory()->create(['name' => 'Cámaras']);

    expect(fn () => Category::factory()->create(['name' => 'Cámaras']))
        ->toThrow(QueryException::class);
});

it('enforces unique slug', function () {
    Category::factory()->create(['slug' => 'camaras']);

    expect(fn () => Category::factory()->create(['slug' => 'camaras']))
        ->toThrow(QueryException::class);
});

it('can delete a category with no products', function () {
    $category = Category::factory()->create();

    $category->delete();

    expect(Category::count())->toBe(0);
});

it('prevents deleting a category with associated products', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create();
    $category->products()->attach($product->id);

    $category->delete();
})->throws(HttpException::class);

it('whereHasSyscomId scope returns only categories with syscom_id in metadata', function () {
    Category::factory()->create([
        'name' => 'With Syscom',
        'slug' => 'with-syscom',
        'metadata' => ['syscom_id' => 'cat-001'],
    ]);
    Category::factory()->create([
        'name' => 'Without Syscom',
        'slug' => 'without-syscom',
        'metadata' => ['other_key' => 'value'],
    ]);
    Category::factory()->create([
        'name' => 'No Metadata',
        'slug' => 'no-metadata',
        'metadata' => null,
    ]);

    $results = Category::whereHasSyscomId()->get();

    expect($results)->toHaveCount(1)
        ->and($results[0]->name)->toBe('With Syscom');
});

it('whereHasSyscomId scope excludes categories with empty syscom_id', function () {
    Category::factory()->create([
        'name' => 'Empty Syscom',
        'slug' => 'empty-syscom',
        'metadata' => ['syscom_id' => ''],
    ]);
    Category::factory()->create([
        'name' => 'Valid',
        'slug' => 'valid',
        'metadata' => ['syscom_id' => 'cat-valid'],
    ]);

    $results = Category::whereHasSyscomId()->get();

    expect($results)->toHaveCount(1)
        ->and($results[0]->name)->toBe('Valid');
});

it('importedSyscomIds returns only syscom_id values', function () {
    Category::factory()->create([
        'name' => 'A',
        'slug' => 'a',
        'metadata' => ['syscom_id' => 'id-a'],
    ]);
    Category::factory()->create([
        'name' => 'B',
        'slug' => 'b',
        'metadata' => ['syscom_id' => 'id-b'],
    ]);
    Category::factory()->create([
        'name' => 'C',
        'slug' => 'c',
        'metadata' => null,
    ]);
    Category::factory()->create([
        'name' => 'D',
        'slug' => 'd',
        'metadata' => ['syscom_id' => ''],
    ]);

    $ids = Category::importedSyscomIds();

    expect($ids)->toHaveCount(2)
        ->and($ids->all())->toBe(['id-a', 'id-b']);
});

it('importedSyscomIds returns empty collection when none match', function () {
    Category::factory()->create(['metadata' => null]);
    Category::factory()->create(['metadata' => ['not_syscom' => 'value']]);

    $ids = Category::importedSyscomIds();

    expect($ids)->toHaveCount(0);
});

it('whereHasMetadataKey returns only categories with given key in metadata', function () {
    Category::factory()->create([
        'name' => 'With Partner',
        'slug' => 'with-partner',
        'metadata' => ['partner_id' => 'p-001'],
    ]);
    Category::factory()->create([
        'name' => 'Without Partner',
        'slug' => 'without-partner',
        'metadata' => ['other' => 'val'],
    ]);
    Category::factory()->create([
        'name' => 'Null Meta',
        'slug' => 'null-meta',
        'metadata' => null,
    ]);

    $results = Category::whereHasMetadataKey('partner_id')->get();

    expect($results)->toHaveCount(1)
        ->and($results[0]->name)->toBe('With Partner');
});
