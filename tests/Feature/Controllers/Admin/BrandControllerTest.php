<?php

namespace Tests\Feature\Controllers\Admin;

use App\Models\Brand;
use App\Models\Product;
use App\Models\User;

beforeEach(fn () => actingAsAdmin());

describe('Admin BrandController', function () {
    describe('index', function () {
        it('renders paginated brands list', function () {
            Brand::factory()->count(20)->create();

            $response = $this->actingAs($this->admin)->get('/admin/brands');

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component('admin/brands/index')
                    ->has('brands.data', 15)
                    ->where('brands.total', 20)
                );
        });

        it('includes product count per brand', function () {
            $brand = Brand::factory()->create();
            Product::factory()->count(3)->create(['brand_id' => $brand->id]);

            $response = $this->actingAs($this->admin)->get('/admin/brands');

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->has('brands.data', 1)
                    ->where('brands.data.0.products_count', 3)
                );
        });

        it('denies access to non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);

            $response = $this->actingAs($user)->get('/admin/brands');

            $response->assertForbidden();
        });

        it('redirects unauthenticated to login', function () {
            $response = $this->get('/admin/brands');

            $response->assertRedirect('/login');
        });
    });

    describe('create', function () {
        it('renders create form', function () {
            $response = $this->actingAs($this->admin)->get('/admin/brands/create');

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component('admin/brands/create')
                );
        });
    });

    describe('store', function () {
        it('creates brand with valid data', function () {
            $response = $this->actingAs($this->admin)->post('/admin/brands', [
                'name' => 'Samsung',
            ]);

            $response->assertRedirect('/admin/brands');

            $this->assertDatabaseHas('brands', [
                'name' => 'Samsung',
                'slug' => 'samsung',
            ]);
        });

        it('auto-generates slug from name', function () {
            $this->actingAs($this->admin)->post('/admin/brands', [
                'name' => 'Sony Corporation',
            ]);

            $this->assertDatabaseHas('brands', [
                'name' => 'Sony Corporation',
                'slug' => 'sony-corporation',
            ]);
        });

        it('fails with duplicate name', function () {
            Brand::factory()->create(['name' => 'Apple']);

            $response = $this->actingAs($this->admin)->post('/admin/brands', [
                'name' => 'Apple',
            ]);

            $response->assertInvalid(['name']);
        });

        it('fails when name is missing', function () {
            $response = $this->actingAs($this->admin)->post('/admin/brands', []);

            $response->assertInvalid(['name']);
        });
    });

    describe('edit', function () {
        it('renders edit form with brand data', function () {
            $brand = Brand::factory()->create(['name' => 'Nike', 'slug' => 'nike']);

            $response = $this->actingAs($this->admin)->get("/admin/brands/{$brand->id}/edit");

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component('admin/brands/[id]/edit')
                    ->where('brand.id', $brand->id)
                    ->where('brand.name', 'Nike')
                    ->where('brand.slug', 'nike')
                );
        });
    });

    describe('update', function () {
        it('updates brand name and regenerates slug', function () {
            $brand = Brand::factory()->create(['name' => 'Old Name', 'slug' => 'old-name']);

            $response = $this->actingAs($this->admin)->put("/admin/brands/{$brand->id}", [
                'name' => 'New Name',
            ]);

            $response->assertRedirect('/admin/brands');

            $this->assertDatabaseHas('brands', [
                'id' => $brand->id,
                'name' => 'New Name',
                'slug' => 'new-name',
            ]);
        });

        it('fails with duplicate name on update', function () {
            $brand1 = Brand::factory()->create(['name' => 'Brand One']);
            $brand2 = Brand::factory()->create(['name' => 'Brand Two']);

            $response = $this->actingAs($this->admin)->put("/admin/brands/{$brand2->id}", [
                'name' => 'Brand One',
            ]);

            $response->assertInvalid(['name']);
        });
    });

    describe('destroy', function () {
        it('deletes brand when it has no products', function () {
            $brand = Brand::factory()->create();

            $response = $this->actingAs($this->admin)->delete("/admin/brands/{$brand->id}");

            $response->assertRedirect('/admin/brands');
            $this->assertDatabaseMissing('brands', ['id' => $brand->id]);
        });

        it('returns 409 conflict when brand has products', function () {
            $brand = Brand::factory()->create();
            Product::factory()->create(['brand_id' => $brand->id]);

            $response = $this->actingAs($this->admin)->delete("/admin/brands/{$brand->id}");

            $response->assertStatus(409);
            $this->assertDatabaseHas('brands', ['id' => $brand->id]);
        });
    });
});
