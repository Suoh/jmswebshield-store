<?php

namespace Tests\Feature\Controllers\Admin;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    actingAsAdmin();
    Storage::fake('public');
});

describe('Admin ProductImageController', function () {
    describe('store', function () {
        it('uploads image and creates product_image record', function () {
            $product = Product::factory()->create();

            $file = UploadedFile::fake()->image('product.jpg', 400, 300);

            $response = $this->actingAs($this->admin)->post(
                "/admin/products/{$product->id}/images",
                ['image' => $file]
            );

            $response->assertRedirect();
            $this->assertDatabaseHas('product_images', [
                'product_id' => $product->id,
                'is_cover' => true,
            ]);
            $image = ProductImage::where('product_id', $product->id)->first();
            $this->assertNotNull($image->path);
            Storage::disk('public')->assertExists($image->path);
        });

        it('sets first image as cover by default', function () {
            $product = Product::factory()->create();
            $file = UploadedFile::fake()->image('first.jpg');

            $this->actingAs($this->admin)->post(
                "/admin/products/{$product->id}/images",
                ['image' => $file]
            );

            $image = ProductImage::where('product_id', $product->id)->first();
            $this->assertTrue($image->is_cover);
        });

        it('rejects when product already has 6 images', function () {
            $product = Product::factory()->create();
            ProductImage::factory()->count(6)->create(['product_id' => $product->id]);

            $file = UploadedFile::fake()->image('overflow.jpg');

            $response = $this->actingAs($this->admin)->post(
                "/admin/products/{$product->id}/images",
                ['image' => $file]
            );

            $response->assertSessionHasErrors('image');
        });

        it('rejects files larger than 2MB', function () {
            $product = Product::factory()->create();
            $file = UploadedFile::fake()->image('large.jpg')->size(3 * 1024);

            $response = $this->actingAs($this->admin)->post(
                "/admin/products/{$product->id}/images",
                ['image' => $file]
            );

            $response->assertSessionHasErrors('image');
        });

        it('rejects non-image files', function () {
            $product = Product::factory()->create();
            $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

            $response = $this->actingAs($this->admin)->post(
                "/admin/products/{$product->id}/images",
                ['image' => $file]
            );

            $response->assertSessionHasErrors('image');
        });

        it('denies access to non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);
            $product = Product::factory()->create();
            $file = UploadedFile::fake()->image('test.jpg');

            $response = $this->actingAs($user)->post(
                "/admin/products/{$product->id}/images",
                ['image' => $file]
            );

            $response->assertForbidden();
        });

        it('denies access to unauthenticated users', function () {
            $product = Product::factory()->create();
            $file = UploadedFile::fake()->image('test.jpg');

            $response = $this->post("/admin/products/{$product->id}/images", [
                'image' => $file,
            ]);

            $response->assertRedirect('/login');
        });
    });

    describe('setCover', function () {
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

            $response = $this->actingAs($this->admin)->put(
                "/admin/products/{$product->id}/images/{$img2->id}/cover"
            );

            $response->assertRedirect();
            $this->assertTrue($img2->fresh()->is_cover);
            $this->assertFalse($img1->fresh()->is_cover);
        });

        it('returns 404 for nonexistent image', function () {
            $product = Product::factory()->create();

            $response = $this->actingAs($this->admin)->put(
                "/admin/products/{$product->id}/images/99999/cover"
            );

            $response->assertNotFound();
        });
    });

    describe('reorder', function () {
        it('updates position of images based on provided order', function () {
            $product = Product::factory()->create();
            $img1 = ProductImage::factory()->create(['product_id' => $product->id, 'position' => 0]);
            $img2 = ProductImage::factory()->create(['product_id' => $product->id, 'position' => 1]);
            $img3 = ProductImage::factory()->create(['product_id' => $product->id, 'position' => 2]);

            $response = $this->actingAs($this->admin)->put(
                "/admin/products/{$product->id}/images/reorder",
                ['ids' => [$img3->id, $img1->id, $img2->id]]
            );

            $response->assertRedirect();
            $this->assertEquals(0, $img3->fresh()->position);
            $this->assertEquals(1, $img1->fresh()->position);
            $this->assertEquals(2, $img2->fresh()->position);
        });

        it('rejects reorder if any image does not belong to product', function () {
            $product = Product::factory()->create();
            $otherProduct = Product::factory()->create();
            $img1 = ProductImage::factory()->create(['product_id' => $product->id]);
            $imgOther = ProductImage::factory()->create(['product_id' => $otherProduct->id]);

            $response = $this->actingAs($this->admin)->put(
                "/admin/products/{$product->id}/images/reorder",
                ['ids' => [$img1->id, $imgOther->id]]
            );

            $response->assertSessionHasErrors();
        });
    });

    describe('destroy', function () {
        it('deletes image file and database record', function () {
            $product = Product::factory()->create();
            $image = ProductImage::factory()->create(['product_id' => $product->id]);
            $path = $image->path;
            Storage::disk('public')->put($path, 'fake-image-data');

            $response = $this->actingAs($this->admin)->delete(
                "/admin/products/{$product->id}/images/{$image->id}"
            );

            $response->assertRedirect();
            $this->assertDatabaseMissing('product_images', ['id' => $image->id]);
            Storage::disk('public')->assertMissing($path);
        });

        it('reassigns cover to next available image when cover is deleted', function () {
            $product = Product::factory()->create();
            $img1 = ProductImage::factory()->create(['product_id' => $product->id, 'is_cover' => true, 'position' => 0]);
            $img2 = ProductImage::factory()->create(['product_id' => $product->id, 'is_cover' => false, 'position' => 1]);

            $this->actingAs($this->admin)->delete(
                "/admin/products/{$product->id}/images/{$img1->id}"
            );

            $this->assertTrue($img2->fresh()->is_cover);
        });

        it('returns 404 for nonexistent image', function () {
            $product = Product::factory()->create();

            $response = $this->actingAs($this->admin)->delete(
                "/admin/products/{$product->id}/images/99999"
            );

            $response->assertNotFound();
        });
    });

    describe('batchStore', function () {
        it('returns url for each uploaded image', function () {
            $product = Product::factory()->create();
            $files = [
                UploadedFile::fake()->image('batch1.jpg', 400, 300),
                UploadedFile::fake()->image('batch2.jpg', 400, 300),
            ];

            $response = $this->actingAs($this->admin)->post(
                "/admin/products/{$product->id}/images/batch",
                ['images' => $files]
            );

            $response->assertStatus(201);
            $images = $response->json('images');

            expect($images)->toHaveCount(2);
            foreach ($images as $image) {
                expect($image)->toHaveKey('url')
                    ->and($image['url'])->toBe(asset('storage/'.$image['path']));
            }
        });
    });

    describe('cover image fallback', function () {
        it('product coverImage returns image_url when no images exist', function () {
            $product = Product::factory()->create(['image_url' => 'https://example.com/img.jpg']);

            $this->assertEquals('https://example.com/img.jpg', $product->coverImage);
        });

        it('product coverImage returns first image when images exist', function () {
            $product = Product::factory()->create();
            $img = ProductImage::factory()->create([
                'product_id' => $product->id,
                'is_cover' => true,
            ]);

            $this->assertStringContainsString('products', $product->coverImage);
        });

        it('product coverImage returns cover image even when first image is not cover', function () {
            $product = Product::factory()->create();
            ProductImage::factory()->create([
                'product_id' => $product->id,
                'is_cover' => false,
                'position' => 0,
            ]);
            $coverImg = ProductImage::factory()->create([
                'product_id' => $product->id,
                'is_cover' => true,
                'position' => 1,
            ]);

            $this->assertStringContainsString($coverImg->path, $product->fresh()->coverImage);
        });
    });
});
