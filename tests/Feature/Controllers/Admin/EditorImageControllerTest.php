<?php

use App\Models\EditorImage;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

beforeEach(function () {
    actingAsAdmin();
    Storage::fake('public');
});

describe('Admin EditorImageController', function () {
    describe('store', function () {
        it('uploads image and returns 201 with id and url', function () {
            $file = UploadedFile::fake()->create('test.jpg', 500, 'image/jpeg');

            $response = $this
                ->actingAs($this->admin)
                ->postJson(route('admin.editor-images.store'), [
                    'image' => $file,
                    'session_id' => Str::uuid()->toString(),
                ]);

            $response->assertStatus(201)
                ->assertJsonStructure(['id', 'url']);
        });

        it('sets product_id to null for pending images', function () {
            $file = UploadedFile::fake()->create('test.jpg', 500, 'image/jpeg');

            $this
                ->actingAs($this->admin)
                ->postJson(route('admin.editor-images.store'), [
                    'image' => $file,
                    'session_id' => Str::uuid()->toString(),
                ]);

            expect(EditorImage::first()->product_id)->toBeNull();
        });

        it('fails with 422 when session_id is missing', function () {
            $file = UploadedFile::fake()->create('test.jpg', 500, 'image/jpeg');

            $response = $this
                ->actingAs($this->admin)
                ->postJson(route('admin.editor-images.store'), [
                    'image' => $file,
                ]);

            $response->assertStatus(422);
        });

        it('fails with 422 when session_id is not a UUID', function () {
            $file = UploadedFile::fake()->create('test.jpg', 500, 'image/jpeg');

            $response = $this
                ->actingAs($this->admin)
                ->postJson(route('admin.editor-images.store'), [
                    'image' => $file,
                    'session_id' => 'invalid',
                ]);

            $response->assertStatus(422);
        });

        it('fails with 422 when file is larger than 2MB', function () {
            $file = UploadedFile::fake()->create('big.jpg', 2500, 'image/jpeg');

            $response = $this
                ->actingAs($this->admin)
                ->postJson(route('admin.editor-images.store'), [
                    'image' => $file,
                    'session_id' => Str::uuid()->toString(),
                ]);

            $response->assertStatus(422);
        });

        it('fails with 422 for non-image MIME types', function () {
            $file = UploadedFile::fake()->create('doc.pdf', 500, 'application/pdf');

            $response = $this
                ->actingAs($this->admin)
                ->postJson(route('admin.editor-images.store'), [
                    'image' => $file,
                    'session_id' => Str::uuid()->toString(),
                ]);

            $response->assertStatus(422);
        });

        it('denies access to guest', function () {
            $file = UploadedFile::fake()->create('test.jpg', 500, 'image/jpeg');

            $response = $this->postJson(route('admin.editor-images.store'), [
                'image' => $file,
                'session_id' => Str::uuid()->toString(),
            ]);

            $response->assertStatus(401);
        });

        it('denies access to non-admin', function () {
            $user = User::factory()->create(['email' => 'regular@test.com']);

            $file = UploadedFile::fake()->create('test.jpg', 500, 'image/jpeg');

            $response = $this
                ->actingAs($user)
                ->postJson(route('admin.editor-images.store'), [
                    'image' => $file,
                    'session_id' => Str::uuid()->toString(),
                ]);

            $response->assertStatus(403);
        });

        it('returns url via asset helper', function () {
            $file = UploadedFile::fake()->create('test.jpg', 500, 'image/jpeg');

            $response = $this
                ->actingAs($this->admin)
                ->postJson(route('admin.editor-images.store'), [
                    'image' => $file,
                    'session_id' => Str::uuid()->toString(),
                ]);

            $json = $response->json();
            expect($json['url'])->toContain('/storage/editor-images/pending/');
        });
    });

    describe('destroy', function () {
        it('deletes image and returns 204', function () {
            $image = EditorImage::factory()->create();

            $response = $this
                ->actingAs($this->admin)
                ->deleteJson(route('admin.editor-images.destroy', $image->id));

            $response->assertStatus(204);
            $this->assertDatabaseMissing('editor_images', ['id' => $image->id]);
        });

        it('denies access to non-admin', function () {
            $user = User::factory()->create(['email' => 'regular@test.com']);
            $image = EditorImage::factory()->create();

            $response = $this
                ->actingAs($user)
                ->deleteJson(route('admin.editor-images.destroy', $image->id));

            $response->assertStatus(403);
        });
    });

    describe('link', function () {
        it('links pending images to a product', function () {
            $product = Product::factory()->create();
            $image1 = EditorImage::factory()->create(['product_id' => null]);
            $image2 = EditorImage::factory()->create(['product_id' => null]);

            $response = $this
                ->actingAs($this->admin)
                ->postJson(route('admin.products.editor-images.link', $product->id), [
                    'editor_image_ids' => [$image1->id, $image2->id],
                ]);

            $response->assertStatus(200)
                ->assertJson(['linked' => 2]);

            expect(EditorImage::find($image1->id)->product_id)->toBe($product->id);
            expect(EditorImage::find($image2->id)->product_id)->toBe($product->id);
        });

        it('only links images that are not already linked', function () {
            $product = Product::factory()->create();
            $anotherProduct = Product::factory()->create();
            $linked = EditorImage::factory()->forProduct($anotherProduct->id)->create();
            $unlinked = EditorImage::factory()->create(['product_id' => null]);

            $response = $this
                ->actingAs($this->admin)
                ->postJson(route('admin.products.editor-images.link', $product->id), [
                    'editor_image_ids' => [$linked->id, $unlinked->id],
                ]);

            $response->assertJson(['linked' => 1]);
            expect(EditorImage::find($unlinked->id)->product_id)->toBe($product->id);
            expect(EditorImage::find($linked->id)->product_id)->toBe($anotherProduct->id);
        });

        it('fails with 422 when editor_image_ids is not an array', function () {
            $product = Product::factory()->create();

            $response = $this
                ->actingAs($this->admin)
                ->postJson(route('admin.products.editor-images.link', $product->id), [
                    'editor_image_ids' => 'not-an-array',
                ]);

            $response->assertStatus(422);
        });

        it('denies access to non-admin', function () {
            $user = User::factory()->create(['email' => 'regular@test.com']);
            $product = Product::factory()->create();

            $response = $this
                ->actingAs($user)
                ->postJson(route('admin.products.editor-images.link', $product->id), [
                    'editor_image_ids' => [1],
                ]);

            $response->assertStatus(403);
        });
    });
});
