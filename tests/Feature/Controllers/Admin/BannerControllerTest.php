<?php

use App\Models\Banner;
use App\Models\User;
use Illuminate\Http\UploadedFile;

beforeEach(fn () => actingAsAdmin());

describe('Admin BannerController', function () {
    describe('index', function () {
        it('denies access to non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);

            $response = $this->actingAs($user)->get('/admin/banners');

            $response->assertForbidden();
        });

        it('redirects unauthenticated to login', function () {
            $response = $this->get('/admin/banners');

            $response->assertRedirect('/login');
        });

        it('paginates banners ordered by position', function () {
            Banner::factory()->create(['name' => 'Second', 'position' => 2]);
            Banner::factory()->create(['name' => 'First', 'position' => 1]);
            Banner::factory()->create(['name' => 'Third', 'position' => 3]);

            $response = $this->actingAs($this->admin)->get('/admin/banners');

            $response->assertInertia(fn ($page) => $page
                ->component('admin/banners/index')
                ->has('banners.data', 3)
            );

            $data = $response->getOriginalContent()->getData()['page']['props']['banners']['data'];
            expect($data[0]['name'])->toBe('First');
            expect($data[1]['name'])->toBe('Second');
            expect($data[2]['name'])->toBe('Third');
        });
    });

    describe('store', function () {
        it('creates banner with valid data', function () {
            Storage::fake('public');

            $response = $this->actingAs($this->admin)->post('/admin/banners', [
                'name' => 'Oferta Verano',
                'image' => UploadedFile::fake()->image('banner.jpg'),
                'link_url' => 'https://example.com/oferta',
                'position' => 1,
            ]);

            $response->assertRedirect('/admin/banners');

            $this->assertDatabaseHas('banners', [
                'name' => 'Oferta Verano',
                'link_url' => 'https://example.com/oferta',
                'position' => 1,
                'is_active' => true,
            ]);
        });

        it('creates banner without optional fields', function () {
            Storage::fake('public');

            $response = $this->actingAs($this->admin)->post('/admin/banners', [
                'name' => 'Mini Banner',
                'image' => UploadedFile::fake()->image('mini.jpg'),
            ]);

            $response->assertRedirect('/admin/banners');

            $this->assertDatabaseHas('banners', [
                'name' => 'Mini Banner',
                'link_url' => null,
                'position' => 0,
            ]);
        });

        it('fails when name is missing', function () {
            $response = $this->actingAs($this->admin)->post('/admin/banners', [
                'image' => UploadedFile::fake()->image('banner.jpg'),
            ]);

            $response->assertInvalid(['name']);
        });

        it('fails when image is not an image', function () {
            $response = $this->actingAs($this->admin)->post('/admin/banners', [
                'name' => 'Bad',
                'image' => UploadedFile::fake()->create('doc.pdf', 100),
            ]);

            $response->assertInvalid(['image']);
        });

        it('fails when image exceeds 2MB', function () {
            $response = $this->actingAs($this->admin)->post('/admin/banners', [
                'name' => 'Big',
                'image' => UploadedFile::fake()->image('big.jpg')->size(3000),
            ]);

            $response->assertInvalid(['image']);
        });
    });

    describe('update', function () {
        it('updates banner fields', function () {
            Storage::fake('public');
            $banner = Banner::factory()->create(['name' => 'Old Name']);

            $response = $this->actingAs($this->admin)->put("/admin/banners/{$banner->id}", [
                'name' => 'New Name',
                'image' => UploadedFile::fake()->image('new.jpg'),
                'link_url' => 'https://example.com',
                'position' => 5,
                'is_active' => false,
            ]);

            $response->assertRedirect('/admin/banners');

            $this->assertDatabaseHas('banners', [
                'id' => $banner->id,
                'name' => 'New Name',
                'link_url' => 'https://example.com',
                'position' => 5,
                'is_active' => false,
            ]);
        });

        it('updates banner without replacing image', function () {
            $banner = Banner::factory()->create(['image_path' => 'banners/old.jpg']);

            $response = $this->actingAs($this->admin)->put("/admin/banners/{$banner->id}", [
                'name' => 'No New Image',
            ]);

            $response->assertRedirect('/admin/banners');

            $this->assertDatabaseHas('banners', [
                'id' => $banner->id,
                'name' => 'No New Image',
                'image_path' => 'banners/old.jpg',
            ]);
        });
    });

    describe('destroy', function () {
        it('deletes banner', function () {
            $banner = Banner::factory()->create();

            $response = $this->actingAs($this->admin)->delete("/admin/banners/{$banner->id}");

            $response->assertRedirect('/admin/banners');
            $this->assertDatabaseMissing('banners', ['id' => $banner->id]);
        });
    });
});
