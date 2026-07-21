<?php

use App\Models\Category;
use App\Models\FeaturedItem;
use App\Models\User;

beforeEach(fn () => actingAsAdmin());

describe('Admin FeaturedCategoryController', function () {
    describe('index', function () {
        it('denies access to non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);

            $response = $this->actingAs($user)->get('/admin/featured/categories');

            $response->assertForbidden();
        });

        it('redirects unauthenticated to login', function () {
            $response = $this->get('/admin/featured/categories');

            $response->assertRedirect('/login');
        });

        it('lists featured categories ordered by position', function () {
            $catA = Category::factory()->create(['name' => 'Audio']);
            $catB = Category::factory()->create(['name' => 'Redes']);

            FeaturedItem::factory()->create([
                'featurable_id' => $catA->id,
                'featurable_type' => Category::class,
                'position' => 2,
            ]);
            FeaturedItem::factory()->create([
                'featurable_id' => $catB->id,
                'featurable_type' => Category::class,
                'position' => 1,
            ]);

            $response = $this->actingAs($this->admin)->get('/admin/featured/categories');

            $response->assertInertia(fn ($page) => $page
                ->component('admin/featured/categories/index')
                ->has('items', 2)
            );

            $data = $response->getOriginalContent()->getData()['page']['props']['items'];
            expect($data[0]['position'])->toBe(1);
            expect($data[1]['position'])->toBe(2);
        });

        it('includes non-featured categories for selection', function () {
            Category::factory()->create(['name' => 'Featured']);
            Category::factory()->create(['name' => 'Not Featured']);

            $fi = FeaturedItem::factory()->create([
                'featurable_id' => Category::first()->id,
                'featurable_type' => Category::class,
            ]);

            $response = $this->actingAs($this->admin)->get('/admin/featured/categories');

            $props = $response->getOriginalContent()->getData()['page']['props'];
            expect($props['categories'])->toHaveCount(1);
            expect($props['categories'][0]['name'])->toBe('Not Featured');
        });
    });

    describe('store', function () {
        it('adds a category as featured', function () {
            $category = Category::factory()->create();

            $response = $this->actingAs($this->admin)->post('/admin/featured/categories', [
                'category_id' => $category->id,
            ]);

            $response->assertRedirect('/admin/featured/categories');

            $this->assertDatabaseHas('featured_items', [
                'featurable_id' => $category->id,
                'featurable_type' => Category::class,
                'position' => 0,
            ]);
        });

        it('prevents duplicate featured category', function () {
            $category = Category::factory()->create();
            FeaturedItem::factory()->create([
                'featurable_id' => $category->id,
                'featurable_type' => Category::class,
            ]);

            $response = $this->actingAs($this->admin)->post('/admin/featured/categories', [
                'category_id' => $category->id,
            ]);

            $response->assertSessionHas('error');
        });

        it('fails when category does not exist', function () {
            $response = $this->actingAs($this->admin)->post('/admin/featured/categories', [
                'category_id' => 999,
            ]);

            $response->assertInvalid(['category_id']);
        });
    });

    describe('destroy', function () {
        it('removes a featured category', function () {
            $category = Category::factory()->create();
            $item = FeaturedItem::factory()->create([
                'featurable_id' => $category->id,
                'featurable_type' => Category::class,
            ]);

            $response = $this->actingAs($this->admin)->delete("/admin/featured/categories/{$item->id}");

            $response->assertRedirect('/admin/featured/categories');
            $this->assertDatabaseMissing('featured_items', ['id' => $item->id]);
        });

        it('returns 404 when mismatched type', function () {
            $item = FeaturedItem::factory()->create([
                'featurable_type' => Product::class,
            ]);

            $response = $this->actingAs($this->admin)->delete("/admin/featured/categories/{$item->id}");

            $response->assertNotFound();
        });
    });

    describe('reorder', function () {
        it('updates positions from array of ids', function () {
            $catA = Category::factory()->create();
            $catB = Category::factory()->create();
            $catC = Category::factory()->create();

            $itemA = FeaturedItem::factory()->create([
                'featurable_id' => $catA->id, 'featurable_type' => Category::class, 'position' => 0,
            ]);
            $itemB = FeaturedItem::factory()->create([
                'featurable_id' => $catB->id, 'featurable_type' => Category::class, 'position' => 1,
            ]);
            $itemC = FeaturedItem::factory()->create([
                'featurable_id' => $catC->id, 'featurable_type' => Category::class, 'position' => 2,
            ]);

            $response = $this->actingAs($this->admin)->put('/admin/featured/categories/reorder', [
                'ids' => [$itemC->id, $itemA->id, $itemB->id],
            ]);

            $response->assertRedirect('/admin/featured/categories');

            $this->assertDatabaseHas('featured_items', ['id' => $itemC->id, 'position' => 0]);
            $this->assertDatabaseHas('featured_items', ['id' => $itemA->id, 'position' => 1]);
            $this->assertDatabaseHas('featured_items', ['id' => $itemB->id, 'position' => 2]);
        });
    });
});
