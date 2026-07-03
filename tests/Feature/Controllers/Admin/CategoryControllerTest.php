<?php

namespace Tests\Feature\Controllers\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

beforeEach(fn () => actingAsAdmin());

describe('Admin CategoryController', function () {
    describe('index', function () {
        it('denies access to non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);

            $response = $this->actingAs($user)->get('/admin/categories');

            $response->assertForbidden();
        });

        it('redirects unauthenticated to login', function () {
            $response = $this->get('/admin/categories');

            $response->assertRedirect('/login');
        });
    });

    describe('store', function () {
        it('creates category with valid data', function () {
            $response = $this->actingAs($this->admin)->post('/admin/categories', [
                'name' => 'Cámaras',
            ]);

            $response->assertRedirect('/admin/categories');

            $this->assertDatabaseHas('categories', [
                'name' => 'Cámaras',
                'slug' => 'camaras',
            ]);
        });

        it('auto-generates slug from name', function () {
            $this->actingAs($this->admin)->post('/admin/categories', [
                'name' => 'Redes y Conectividad',
            ]);

            $this->assertDatabaseHas('categories', [
                'name' => 'Redes y Conectividad',
                'slug' => 'redes-y-conectividad',
            ]);
        });

        it('fails with duplicate name', function () {
            Category::factory()->create(['name' => 'Audio']);

            $response = $this->actingAs($this->admin)->post('/admin/categories', [
                'name' => 'Audio',
            ]);

            $response->assertInvalid(['name']);
        });

        it('fails when name is missing', function () {
            $response = $this->actingAs($this->admin)->post('/admin/categories', []);

            $response->assertInvalid(['name']);
        });
    });

    describe('update', function () {
        it('updates category name and regenerates slug', function () {
            $category = Category::factory()->create(['name' => 'Nombre Antiguo', 'slug' => 'nombre-antiguo']);

            $response = $this->actingAs($this->admin)->put("/admin/categories/{$category->id}", [
                'name' => 'Nombre Nuevo',
            ]);

            $response->assertRedirect('/admin/categories');

            $this->assertDatabaseHas('categories', [
                'id' => $category->id,
                'name' => 'Nombre Nuevo',
                'slug' => 'nombre-nuevo',
            ]);
        });

        it('fails with duplicate name on update', function () {
            $category1 = Category::factory()->create(['name' => 'Categoría Uno']);
            $category2 = Category::factory()->create(['name' => 'Categoría Dos']);

            $response = $this->actingAs($this->admin)->put("/admin/categories/{$category2->id}", [
                'name' => 'Categoría Uno',
            ]);

            $response->assertInvalid(['name']);
        });
    });

    describe('destroy', function () {
        it('deletes category when it has no products', function () {
            $category = Category::factory()->create();

            $response = $this->actingAs($this->admin)->delete("/admin/categories/{$category->id}");

            $response->assertRedirect('/admin/categories');
            $this->assertDatabaseMissing('categories', ['id' => $category->id]);
        });

        it('returns 409 conflict when category has products', function () {
            $category = Category::factory()->create();
            $product = Product::factory()->create();
            $category->products()->attach($product);

            $response = $this->actingAs($this->admin)->delete("/admin/categories/{$category->id}");

            $response->assertStatus(409);
            $this->assertDatabaseHas('categories', ['id' => $category->id]);
        });
    });
});
