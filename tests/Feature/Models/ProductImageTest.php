<?php

namespace Tests\Feature\Models;

use App\Models\ProductImage;
use Illuminate\Support\Facades\Storage;

it('has url accessor using asset helper', function () {
    Storage::fake('public');

    $image = ProductImage::factory()->create(['path' => 'products/test-image.jpg']);

    $expectedUrl = asset('storage/products/test-image.jpg');
    expect($image->url)->toBe($expectedUrl);
});

it('url is included in array output via appends', function () {
    $image = ProductImage::factory()->create(['path' => 'products/appended.jpg']);

    $array = $image->toArray();

    expect($array)->toHaveKey('url')
        ->and($array['url'])->toBe(asset('storage/products/appended.jpg'));
});

it('url is included in appended fields', function () {
    $image = ProductImage::factory()->create(['path' => 'products/appends-test.jpg']);

    expect($image->toArray())->toHaveKey('url');
});
