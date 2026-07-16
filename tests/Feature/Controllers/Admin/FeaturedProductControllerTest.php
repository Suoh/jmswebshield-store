<?php

use App\Models\FeaturedItem;
use App\Models\Product;
use App\Models\User;

beforeEach(fn () => actingAsAdmin());

describe('Admin FeaturedProductController', function () {
    describe('index', function () {
        it('denies access to non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);

            $response = $this->actingAs($user)->get('/admin/featured/products');

            $response->assertForbidden();
        });

        it('redirects unauthenticated to login', function () {
            $response = $this->get('/admin/featured/products');

            $response->assertRedirect('/login');
        });

        it('lists featured products ordered by position', function () {
            $prodA = Product::factory()->create();
            $prodB = Product::factory()->create();

            FeaturedItem::factory()->create([
                'featurable_id' => $prodA->id,
                'featurable_type' => Product::class,
                'position' => 2,
            ]);
            FeaturedItem::factory()->create([
                'featurable_id' => $prodB->id,
                'featurable_type' => Product::class,
                'position' => 1,
            ]);

            $response = $this->actingAs($this->admin)->get('/admin/featured/products');

            $response->assertInertia(fn ($page) => $page
                ->component('admin/featured/products/index')
                ->has('items', 2)
            );

            $data = $response->getOriginalContent()->getData()['page']['props']['items'];
            expect($data[0]['position'])->toBe(1);
            expect($data[1]['position'])->toBe(2);
        });
    });

    describe('store', function () {
        it('adds a product as featured', function () {
            $product = Product::factory()->create();

            $response = $this->actingAs($this->admin)->post('/admin/featured/products', [
                'product_id' => $product->id,
            ]);

            $response->assertRedirect('/admin/featured/products');

            $this->assertDatabaseHas('featured_items', [
                'featurable_id' => $product->id,
                'featurable_type' => Product::class,
                'position' => 0,
            ]);
        });

        it('prevents duplicate featured product', function () {
            $product = Product::factory()->create();
            FeaturedItem::factory()->create([
                'featurable_id' => $product->id,
                'featurable_type' => Product::class,
            ]);

            $response = $this->actingAs($this->admin)->post('/admin/featured/products', [
                'product_id' => $product->id,
            ]);

            $response->assertSessionHas('error');
        });

        it('fails when product does not exist', function () {
            $response = $this->actingAs($this->admin)->post('/admin/featured/products', [
                'product_id' => 999,
            ]);

            $response->assertInvalid(['product_id']);
        });
    });

    describe('destroy', function () {
        it('removes a featured product', function () {
            $product = Product::factory()->create();
            $item = FeaturedItem::factory()->create([
                'featurable_id' => $product->id,
                'featurable_type' => Product::class,
            ]);

            $response = $this->actingAs($this->admin)->delete("/admin/featured/products/{$item->id}");

            $response->assertRedirect('/admin/featured/products');
            $this->assertDatabaseMissing('featured_items', ['id' => $item->id]);
        });

        it('returns 404 when mismatched type', function () {
            $item = FeaturedItem::factory()->create([
                'featurable_type' => Category::class,
            ]);

            $response = $this->actingAs($this->admin)->delete("/admin/featured/products/{$item->id}");

            $response->assertNotFound();
        });
    });

    describe('reorder', function () {
        it('updates positions from array of ids', function () {
            $prodA = Product::factory()->create();
            $prodB = Product::factory()->create();

            $itemA = FeaturedItem::factory()->create([
                'featurable_id' => $prodA->id, 'featurable_type' => Product::class, 'position' => 0,
            ]);
            $itemB = FeaturedItem::factory()->create([
                'featurable_id' => $prodB->id, 'featurable_type' => Product::class, 'position' => 1,
            ]);

            $response = $this->actingAs($this->admin)->put('/admin/featured/products/reorder', [
                'ids' => [$itemB->id, $itemA->id],
            ]);

            $response->assertRedirect('/admin/featured/products');

            $this->assertDatabaseHas('featured_items', ['id' => $itemB->id, 'position' => 0]);
            $this->assertDatabaseHas('featured_items', ['id' => $itemA->id, 'position' => 1]);
        });
    });
});
