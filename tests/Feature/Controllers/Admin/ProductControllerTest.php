<?php

namespace Tests\Feature\Controllers\Admin;

use App\Models\Brand;
use App\Models\Product;
use App\Models\User;

beforeEach(fn () => actingAsAdmin());

describe('Admin ProductController', function () {
    describe('index', function () {
        it('renders paginated products list with brand', function () {
            $brand = Brand::factory()->create();
            Product::factory()->count(20)->create(['brand_id' => $brand->id]);

            $response = $this->actingAs($this->admin)->get('/admin/products');

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component('admin/products/index')
                    ->has('products.data', 15)
                    ->where('products.total', 20)
                );
        });

        it('filters by search (name)', function () {
            Product::factory()->create(['name' => 'Samsung TV']);
            Product::factory()->create(['name' => 'LG Monitor']);

            $response = $this->actingAs($this->admin)->get('/admin/products?search=Samsung');

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->has('products.data', 1)
                    ->where('products.data.0.name', 'Samsung TV')
                );
        });

        it('filters by brand_id', function () {
            $brand1 = Brand::factory()->create();
            $brand2 = Brand::factory()->create();
            Product::factory()->create(['name' => 'Product A', 'brand_id' => $brand1->id]);
            Product::factory()->create(['name' => 'Product B', 'brand_id' => $brand2->id]);

            $response = $this->actingAs($this->admin)->get("/admin/products?brand_id={$brand1->id}");

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->has('products.data', 1)
                    ->where('products.data.0.name', 'Product A')
                );
        });

        it('filters by is_active', function () {
            Product::factory()->create(['name' => 'Active Product', 'is_active' => true]);
            Product::factory()->create(['name' => 'Inactive Product', 'is_active' => false]);

            $response = $this->actingAs($this->admin)->get('/admin/products?is_active=1');

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->has('products.data', 1)
                    ->where('products.data.0.name', 'Active Product')
                );
        });

        it('denies access to non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);

            $response = $this->actingAs($user)->get('/admin/products');

            $response->assertForbidden();
        });

        it('redirects unauthenticated to login', function () {
            $response = $this->get('/admin/products');

            $response->assertRedirect('/login');
        });
    });

    describe('create', function () {
        it('renders create form', function () {
            $response = $this->actingAs($this->admin)->get('/admin/products/create');

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component('admin/products/create')
                );
        });
    });

    describe('store', function () {
        it('creates product with valid data', function () {
            $brand = Brand::factory()->create();

            $response = $this->actingAs($this->admin)->post('/admin/products', [
                'name' => 'Samsung TV 55"',
                'short_description' => 'Smart TV 55 pulgadas',
                'full_description' => 'Televisor Samsung 55 pulgadas 4K',
                'price' => 1299.99,
                'stock' => 10,
                'discount' => 15,
                'sku' => 'SAM-TV-55',
                'brand_id' => $brand->id,
                'model' => 'UN55AU9000',
                'image_url' => 'https://example.com/tv.jpg',
                'is_active' => true,
            ]);

            $response->assertRedirect('/admin/products');

            $this->assertDatabaseHas('products', [
                'name' => 'Samsung TV 55"',
                'sku' => 'SAM-TV-55',
                'price' => 1299.99,
                'stock' => 10,
                'discount' => 15,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);
        });

        it('creates product with minimal data', function () {
            $response = $this->actingAs($this->admin)->post('/admin/products', [
                'name' => 'Minimal Product',
                'price' => 99.99,
                'sku' => 'MIN-001',
                'is_active' => true,
            ]);

            $response->assertRedirect('/admin/products');

            $this->assertDatabaseHas('products', [
                'name' => 'Minimal Product',
                'price' => 99.99,
                'sku' => 'MIN-001',
            ]);
        });

        it('fails when name is missing', function () {
            $response = $this->actingAs($this->admin)->post('/admin/products', [
                'price' => 99.99,
                'sku' => 'SKU-001',
            ]);

            $response->assertInvalid(['name']);
        });

        it('fails when price is missing', function () {
            $response = $this->actingAs($this->admin)->post('/admin/products', [
                'name' => 'Test Product',
                'sku' => 'SKU-001',
            ]);

            $response->assertInvalid(['price']);
        });

        it('fails when price is negative', function () {
            $response = $this->actingAs($this->admin)->post('/admin/products', [
                'name' => 'Test Product',
                'price' => -10,
                'sku' => 'SKU-001',
            ]);

            $response->assertInvalid(['price']);
        });

        it('fails when sku is not unique', function () {
            Product::factory()->create(['sku' => 'EXISTING-SKU']);

            $response = $this->actingAs($this->admin)->post('/admin/products', [
                'name' => 'Test Product',
                'price' => 99.99,
                'sku' => 'EXISTING-SKU',
            ]);

            $response->assertInvalid(['sku']);
        });

        it('fails when discount is out of range', function () {
            $response = $this->actingAs($this->admin)->post('/admin/products', [
                'name' => 'Test Product',
                'price' => 99.99,
                'sku' => 'SKU-001',
                'discount' => 150,
            ]);

            $response->assertInvalid(['discount']);
        });

        it('fails when brand_id does not exist', function () {
            $response = $this->actingAs($this->admin)->post('/admin/products', [
                'name' => 'Test Product',
                'price' => 99.99,
                'sku' => 'SKU-001',
                'brand_id' => 99999,
            ]);

            $response->assertInvalid(['brand_id']);
        });

        it('sanitizes XSS in full_description on store', function () {
            $response = $this->actingAs($this->admin)->post('/admin/products', [
                'name' => 'XSS Test',
                'price' => 99.99,
                'sku' => 'XSS-001',
                'full_description' => '<p>Safe</p><script>alert(1)</script>',
                'is_active' => true,
            ]);

            $response->assertRedirect('/admin/products');

            $this->assertDatabaseHas('products', [
                'sku' => 'XSS-001',
            ]);

            $product = Product::where('sku', 'XSS-001')->first();
            expect($product->full_description)
                ->toContain('<p>Safe</p>')
                ->not->toContain('<script>');
        });
    });

    describe('edit', function () {
        it('renders edit form with product data', function () {
            $brand = Brand::factory()->create();
            $product = Product::factory()->create([
                'name' => 'Edit Me',
                'sku' => 'EDIT-SKU',
                'brand_id' => $brand->id,
            ]);

            $response = $this->actingAs($this->admin)->get("/admin/products/{$product->id}/edit");

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component('admin/products/[id]/edit')
                    ->where('product.id', $product->id)
                    ->where('product.name', 'Edit Me')
                    ->where('product.sku', 'EDIT-SKU')
                );
        });

        it('returns 404 for nonexistent product', function () {
            $response = $this->actingAs($this->admin)->get('/admin/products/99999/edit');

            $response->assertNotFound();
        });
    });

    describe('update', function () {
        it('updates product with valid data', function () {
            $product = Product::factory()->create([
                'name' => 'Old Name',
                'price' => 100.00,
            ]);

            $response = $this->actingAs($this->admin)->put("/admin/products/{$product->id}", [
                'name' => 'New Name',
                'price' => 200.00,
                'sku' => $product->sku,
            ]);

            $response->assertRedirect('/admin/products');

            $this->assertDatabaseHas('products', [
                'id' => $product->id,
                'name' => 'New Name',
                'price' => 200.00,
            ]);
        });

        it('fails when updating with duplicate sku', function () {
            $product1 = Product::factory()->create(['sku' => 'SKU-ONE']);
            $product2 = Product::factory()->create(['sku' => 'SKU-TWO']);

            $response = $this->actingAs($this->admin)->put("/admin/products/{$product2->id}", [
                'name' => 'Updated',
                'price' => 99.99,
                'sku' => 'SKU-ONE',
            ]);

            $response->assertInvalid(['sku']);
        });

        it('allows same sku when updating same product', function () {
            $product = Product::factory()->create(['sku' => 'SAME-SKU']);

            $response = $this->actingAs($this->admin)->put("/admin/products/{$product->id}", [
                'name' => 'Updated Name',
                'price' => 99.99,
                'sku' => 'SAME-SKU',
            ]);

            $response->assertRedirect('/admin/products');
        });

        it('fails when price is negative', function () {
            $product = Product::factory()->create();

            $response = $this->actingAs($this->admin)->put("/admin/products/{$product->id}", [
                'name' => 'Updated',
                'price' => -5,
                'sku' => $product->sku,
            ]);

            $response->assertInvalid(['price']);
        });

        it('fails when discount is out of range', function () {
            $product = Product::factory()->create();

            $response = $this->actingAs($this->admin)->put("/admin/products/{$product->id}", [
                'name' => 'Updated',
                'price' => 99.99,
                'sku' => $product->sku,
                'discount' => 101,
            ]);

            $response->assertInvalid(['discount']);
        });

        it('sanitizes XSS in full_description on update', function () {
            $product = Product::factory()->create([
                'full_description' => '<p>Original</p>',
            ]);

            $response = $this->actingAs($this->admin)->put("/admin/products/{$product->id}", [
                'name' => 'Updated XSS',
                'price' => 149.99,
                'sku' => $product->sku,
                'full_description' => '<b>Bold</b><iframe src="x"></iframe>',
            ]);

            $response->assertRedirect('/admin/products');

            expect($product->fresh()->full_description)
                ->toContain('<b>Bold</b>')
                ->not->toContain('<iframe>');
        });
    });

    describe('destroy (soft delete)', function () {
        it('soft deletes product', function () {
            $product = Product::factory()->create();

            $response = $this->actingAs($this->admin)->delete("/admin/products/{$product->id}");

            $response->assertRedirect('/admin/products');
            $this->assertSoftDeleted('products', ['id' => $product->id]);
        });

        it('product disappears from index', function () {
            $product = Product::factory()->create();
            $productId = $product->id;

            $this->actingAs($this->admin)->delete("/admin/products/{$product->id}");

            $response = $this->actingAs($this->admin)->get('/admin/products');

            $response->assertOk();
            $response->assertInertia(fn ($page) => $page
                ->where('products.data', fn ($items) => (
                    collect($items)->every(fn ($item) => $item['id'] !== $productId)
                ))
            );
        });
    });

    describe('restore', function () {
        it('restores soft deleted product', function () {
            $product = Product::factory()->create();
            $product->delete();

            $response = $this->actingAs($this->admin)->post("/admin/products/{$product->id}/restore");

            $response->assertRedirect('/admin/products');
            $this->assertDatabaseHas('products', [
                'id' => $product->id,
                'deleted_at' => null,
            ]);
        });

        it('returns 404 for nonexistent product', function () {
            $response = $this->actingAs($this->admin)->post('/admin/products/99999/restore');

            $response->assertNotFound();
        });
    });

    describe('forceDelete', function () {
        it('permanently deletes product', function () {
            $product = Product::factory()->create();
            $productId = $product->id;

            $response = $this->actingAs($this->admin)->delete("/admin/products/{$product->id}/force");

            $response->assertRedirect('/admin/products');
            $this->assertDatabaseMissing('products', ['id' => $productId]);
        });

        it('returns 404 for nonexistent product', function () {
            $response = $this->actingAs($this->admin)->delete('/admin/products/99999/force');

            $response->assertNotFound();
        });
    });
});
