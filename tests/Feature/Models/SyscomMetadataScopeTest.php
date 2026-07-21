<?php

use App\Models\Brand;
use App\Models\Product;

it('brand whereHasSyscomId scope returns only brands with syscom_id in metadata', function () {
    Brand::factory()->create([
        'name' => 'Brand With Syscom',
        'slug' => 'with-syscom',
        'metadata' => ['syscom_id' => 'brand-001'],
    ]);
    Brand::factory()->create([
        'name' => 'Brand Without Syscom',
        'slug' => 'without-syscom',
        'metadata' => ['other_key' => 'value'],
    ]);
    Brand::factory()->create([
        'name' => 'Brand No Metadata',
        'slug' => 'no-metadata',
        'metadata' => null,
    ]);

    $results = Brand::whereHasSyscomId()->get();

    expect($results)->toHaveCount(1)
        ->and($results[0]->name)->toBe('Brand With Syscom');
});

it('brand whereHasSyscomId scope excludes brands with empty syscom_id', function () {
    Brand::factory()->create([
        'name' => 'Empty Syscom',
        'slug' => 'empty-syscom',
        'metadata' => ['syscom_id' => ''],
    ]);
    Brand::factory()->create([
        'name' => 'Valid',
        'slug' => 'valid',
        'metadata' => ['syscom_id' => 'brand-valid'],
    ]);

    $results = Brand::whereHasSyscomId()->get();

    expect($results)->toHaveCount(1)
        ->and($results[0]->name)->toBe('Valid');
});

it('brand importedSyscomIds returns only syscom_id values', function () {
    Brand::factory()->create([
        'name' => 'A',
        'slug' => 'a',
        'metadata' => ['syscom_id' => 'id-a'],
    ]);
    Brand::factory()->create([
        'name' => 'B',
        'slug' => 'b',
        'metadata' => ['syscom_id' => 'id-b'],
    ]);
    Brand::factory()->create([
        'name' => 'C',
        'slug' => 'c',
        'metadata' => null,
    ]);
    Brand::factory()->create([
        'name' => 'D',
        'slug' => 'd',
        'metadata' => ['syscom_id' => ''],
    ]);

    $ids = Brand::importedSyscomIds();

    expect($ids)->toHaveCount(2)
        ->and($ids->all())->toBe(['id-a', 'id-b']);
});

it('product whereHasSyscomId scope returns only products with syscom_id in metadata', function () {
    Product::factory()->create([
        'name' => 'P1',
        'metadata' => ['syscom_id' => 'prod-001'],
    ]);
    Product::factory()->create([
        'name' => 'P2',
        'metadata' => ['other' => 'value'],
    ]);
    Product::factory()->create([
        'name' => 'P3',
        'metadata' => null,
    ]);

    $results = Product::whereHasSyscomId()->get();

    expect($results)->toHaveCount(1)
        ->and($results[0]->name)->toBe('P1');
});

it('product whereHasSyscomId scope excludes soft deleted products', function () {
    $active = Product::factory()->create([
        'name' => 'Active',
        'metadata' => ['syscom_id' => 'prod-active'],
    ]);
    $deleted = Product::factory()->create([
        'name' => 'Deleted',
        'metadata' => ['syscom_id' => 'prod-deleted'],
    ]);
    $deleted->delete();

    $results = Product::whereHasSyscomId()->get();

    expect($results)->toHaveCount(1)
        ->and($results[0]->name)->toBe('Active');
});

it('product importedSyscomIds returns only syscom_id values', function () {
    Product::factory()->create([
        'name' => 'A',
        'metadata' => ['syscom_id' => 'prod-a'],
    ]);
    Product::factory()->create([
        'name' => 'B',
        'metadata' => ['syscom_id' => 'prod-b'],
    ]);
    Product::factory()->create([
        'name' => 'C',
        'metadata' => null,
    ]);
    Product::factory()->create([
        'name' => 'D',
        'metadata' => ['syscom_id' => ''],
    ]);

    $ids = Product::importedSyscomIds();

    expect($ids)->toHaveCount(2)
        ->and($ids->all())->toBe(['prod-a', 'prod-b']);
});

it('brand whereHasSyscomId scope is chainable with other scopes', function () {
    Brand::factory()->create([
        'name' => 'Alpha',
        'slug' => 'alpha',
        'metadata' => ['syscom_id' => 'sys-alpha'],
    ]);
    Brand::factory()->create([
        'name' => 'Beta',
        'slug' => 'beta',
        'metadata' => ['syscom_id' => 'sys-beta'],
    ]);

    $results = Brand::whereHasSyscomId()->orderBy('name', 'desc')->get();

    expect($results)->toHaveCount(2)
        ->and($results[0]->name)->toBe('Beta')
        ->and($results[1]->name)->toBe('Alpha');
});

it('product importedSyscomIds returns empty collection when none match', function () {
    Product::factory()->create(['metadata' => null]);
    Product::factory()->create(['metadata' => ['not_syscom' => 'value']]);

    $ids = Product::importedSyscomIds();

    expect($ids)->toHaveCount(0);
});

it('brand importedSyscomIds returns empty collection when none match', function () {
    Brand::factory()->create(['metadata' => null]);
    Brand::factory()->create(['metadata' => ['not_syscom' => 'value']]);

    $ids = Brand::importedSyscomIds();

    expect($ids)->toHaveCount(0);
});

it('brand whereHasMetadataKey returns only brands with given key in metadata', function () {
    Brand::factory()->create([
        'name' => 'With Partner',
        'slug' => 'with-partner',
        'metadata' => ['partner_id' => 'p-001'],
    ]);
    Brand::factory()->create([
        'name' => 'Without Partner',
        'slug' => 'without-partner',
        'metadata' => ['other' => 'val'],
    ]);
    Brand::factory()->create([
        'name' => 'Null Meta',
        'slug' => 'null-meta',
        'metadata' => null,
    ]);

    $results = Brand::whereHasMetadataKey('partner_id')->get();

    expect($results)->toHaveCount(1)
        ->and($results[0]->name)->toBe('With Partner');
});

it('brand whereHasMetadataKey excludes empty values', function () {
    Brand::factory()->create([
        'name' => 'Empty',
        'slug' => 'empty',
        'metadata' => ['key' => ''],
    ]);
    Brand::factory()->create([
        'name' => 'Valid',
        'slug' => 'valid',
        'metadata' => ['key' => 'actual-value'],
    ]);

    $results = Brand::whereHasMetadataKey('key')->get();

    expect($results)->toHaveCount(1)
        ->and($results[0]->name)->toBe('Valid');
});

it('product whereHasMetadataKey returns only products with given key in metadata', function () {
    Product::factory()->create([
        'name' => 'With Ref',
        'metadata' => ['external_ref' => 'ref-001'],
    ]);
    Product::factory()->create([
        'name' => 'Without Ref',
        'metadata' => ['other' => 'val'],
    ]);
    Product::factory()->create([
        'name' => 'Null Meta',
        'metadata' => null,
    ]);

    $results = Product::whereHasMetadataKey('external_ref')->get();

    expect($results)->toHaveCount(1)
        ->and($results[0]->name)->toBe('With Ref');
});
