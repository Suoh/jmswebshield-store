<?php

namespace Tests\Feature\Actions;

use App\Actions\SetCoverImage;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\ModelNotFoundException;

beforeEach(function () {
    actingAsAdmin();
});

describe('SetCoverImage', function () {
    it('sets given image as cover and unsets previous cover', function () {
        $product = Product::factory()->create();
        $img1 = ProductImage::factory()->create([
            'product_id' => $product->id,
            'is_cover' => true,
        ]);
        $img2 = ProductImage::factory()->create([
            'product_id' => $product->id,
            'is_cover' => false,
        ]);

        app(SetCoverImage::class)($product, $img2->id);

        $this->assertTrue($img2->fresh()->is_cover);
        $this->assertFalse($img1->fresh()->is_cover);
    });

    it('throws 404 when image does not belong to product', function () {
        $product = Product::factory()->create();
        $otherProduct = Product::factory()->create();
        $image = ProductImage::factory()->create(['product_id' => $otherProduct->id]);

        expect(fn () => app(SetCoverImage::class)($product, $image->id))
            ->toThrow(ModelNotFoundException::class);
    });

    it('throws 404 for nonexistent image', function () {
        $product = Product::factory()->create();

        expect(fn () => app(SetCoverImage::class)($product, 99999))
            ->toThrow(ModelNotFoundException::class);
    });
});
