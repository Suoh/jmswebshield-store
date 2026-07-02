<?php

namespace Tests\Feature\Actions;

use App\Actions\ReorderProductImages;
use App\Models\Product;
use App\Models\ProductImage;

beforeEach(function () {
    actingAsAdmin();
});

describe('ReorderProductImages', function () {
    it('updates positions based on provided order', function () {
        $product = Product::factory()->create();
        $img1 = ProductImage::factory()->create(['product_id' => $product->id, 'position' => 0]);
        $img2 = ProductImage::factory()->create(['product_id' => $product->id, 'position' => 1]);
        $img3 = ProductImage::factory()->create(['product_id' => $product->id, 'position' => 2]);

        app(ReorderProductImages::class)($product, [$img3->id, $img1->id, $img2->id]);

        $this->assertEquals(0, $img3->fresh()->position);
        $this->assertEquals(1, $img1->fresh()->position);
        $this->assertEquals(2, $img2->fresh()->position);
    });

    it('throws when any image does not belong to product', function () {
        $product = Product::factory()->create();
        $otherProduct = Product::factory()->create();
        $img1 = ProductImage::factory()->create(['product_id' => $product->id]);
        $imgOther = ProductImage::factory()->create(['product_id' => $otherProduct->id]);

        expect(fn () => app(ReorderProductImages::class)($product, [$img1->id, $imgOther->id]))
            ->toThrow(\InvalidArgumentException::class);
    });

    it('throws when provided IDs count differs from product image count', function () {
        $product = Product::factory()->create();
        $img1 = ProductImage::factory()->create(['product_id' => $product->id]);
        ProductImage::factory()->create(['product_id' => $product->id]);

        expect(fn () => app(ReorderProductImages::class)($product, [$img1->id]))
            ->toThrow(\InvalidArgumentException::class, 'Los IDs proporcionados no coinciden');
    });
});
