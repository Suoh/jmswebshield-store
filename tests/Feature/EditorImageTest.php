<?php

use App\Models\EditorImage;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    actingAsAdmin();
});

describe('EditorImage', function () {
    it('generates url accessor via asset helper', function () {
        $image = EditorImage::factory()->create([
            'path' => 'editor-images/test/image.jpg',
        ]);

        expect($image->url)->toBe(asset('storage/editor-images/test/image.jpg'));
    });

    it('url is present in appends', function () {
        $image = EditorImage::factory()->create();

        $array = $image->toArray();

        expect($array)->toHaveKey('url');
    });

    it('belongs to a product', function () {
        $product = Product::factory()->create();
        $image = EditorImage::factory()->forProduct($product->id)->create();

        expect($image->product_id)->toBe($product->id);
        expect($image->product)->toBeInstanceOf(Product::class);
    });

    it('deletes file on model delete', function () {
        Storage::fake('public');
        Storage::disk('public')->put('editor-images/test/del-me.jpg', 'image-content');

        $image = EditorImage::factory()->create([
            'path' => 'editor-images/test/del-me.jpg',
        ]);

        Storage::disk('public')->assertExists('editor-images/test/del-me.jpg');

        $image->delete();

        Storage::disk('public')->assertMissing('editor-images/test/del-me.jpg');
    });

    it('orphans scope returns images without product older than N hours', function () {
        $oldOrphan = EditorImage::factory()->create([
            'product_id' => null,
            'session_id' => 'old-orphan-session',
            'created_at' => now()->subHours(25),
        ]);

        $recentOrphan = EditorImage::factory()->create([
            'product_id' => null,
            'session_id' => 'recent-orphan-session',
            'created_at' => now()->subHours(5),
        ]);

        $linked = EditorImage::factory()->forProduct(Product::factory()->create()->id)->create([
            'created_at' => now()->subHours(25),
        ]);

        $orphans = EditorImage::orphans()->get();

        expect($orphans)->toHaveCount(1)
            ->and($orphans->pluck('id')->toArray())->toContain($oldOrphan->id)
            ->and($orphans->pluck('id')->toArray())->not->toContain($recentOrphan->id)
            ->and($orphans->pluck('id')->toArray())->not->toContain($linked->id);
    });

    it('orphans scope with custom hours respects the parameter', function () {
        EditorImage::factory()->create([
            'product_id' => null,
            'created_at' => now()->subHours(2),
        ]);

        $orphans24 = EditorImage::orphans(24)->get();
        expect($orphans24)->toHaveCount(0);

        $orphans1 = EditorImage::orphans(1)->get();
        expect($orphans1)->toHaveCount(1);
    });
});
