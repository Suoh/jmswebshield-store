<?php

namespace Tests\Feature\Actions;

use App\Actions\DeleteProductImage;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    actingAsAdmin();
    Storage::fake('public');
});

describe('DeleteProductImage', function () {
    it('deletes image file and database record', function () {
        $product = Product::factory()->create();
        $image = ProductImage::factory()->create(['product_id' => $product->id]);
        Storage::disk('public')->put($image->path, 'fake-image-data');

        app(DeleteProductImage::class)($product, $image->id);

        $this->assertDatabaseMissing('product_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($image->path);
    });

    it('reassigns cover to next available image when cover is deleted', function () {
        $product = Product::factory()->create();
        $img1 = ProductImage::factory()->create([
            'product_id' => $product->id,
            'is_cover' => true,
            'position' => 0,
        ]);
        $img2 = ProductImage::factory()->create([
            'product_id' => $product->id,
            'is_cover' => false,
            'position' => 1,
        ]);

        app(DeleteProductImage::class)($product, $img1->id);

        $this->assertTrue($img2->fresh()->is_cover);
    });

    it('throws 404 when image does not belong to product', function () {
        $product = Product::factory()->create();
        $otherProduct = Product::factory()->create();
        $image = ProductImage::factory()->create(['product_id' => $otherProduct->id]);

        expect(fn () => app(DeleteProductImage::class)($product, $image->id))
            ->toThrow(ModelNotFoundException::class);
    });

    it('throws 404 for nonexistent image', function () {
        $product = Product::factory()->create();

        expect(fn () => app(DeleteProductImage::class)($product, 99999))
            ->toThrow(ModelNotFoundException::class);
    });
});
