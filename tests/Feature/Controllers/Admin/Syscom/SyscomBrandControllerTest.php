<?php

namespace Tests\Feature\Controllers\Admin\Syscom;

use App\Models\Brand;
use App\Models\User;
use App\Services\Syscom\SyscomService;
use Mockery;

beforeEach(fn () => actingAsAdmin());

describe('Syscom Brand Import Controller', function () {
    describe('index', function () {
        it('renders page with paginated SYSCOM brands', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getBrands')
                ->with(1)
                ->once()
                ->andReturn([
                    'data' => [
                        ['id' => 'tp-link', 'nombre' => 'TP-Link'],
                        ['id' => 'netgear', 'nombre' => 'Netgear'],
                    ],
                    'current_page' => 1,
                    'last_page' => 2,
                    'total' => 30,
                    'per_page' => 15,
                ]);

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->get('/admin/syscom/brands');

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component('admin/syscom/brands/index')
                    ->has('syscom_brands.data', 2)
                    ->where('syscom_brands.current_page', 1)
                    ->where('syscom_brands.total', 30)
                );
        });

        it('marks already-imported brands by syscom_id', function () {
            Brand::factory()->create([
                'name' => 'TP-Link Local',
                'slug' => 'tp-link',
                'metadata' => ['syscom_id' => 'tp-link'],
            ]);

            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getBrands')
                ->with(1)
                ->once()
                ->andReturn([
                    'data' => [
                        ['id' => 'tp-link', 'nombre' => 'TP-Link'],
                        ['id' => 'ubiquiti', 'nombre' => 'Ubiquiti'],
                    ],
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 2,
                    'per_page' => 15,
                ]);

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->get('/admin/syscom/brands');

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->has('imported_syscom_ids')
                    ->where('imported_syscom_ids', ['tp-link'])
                );
        });

        it('denies access to non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);

            $response = $this->actingAs($user)->get('/admin/syscom/brands');

            $response->assertForbidden();
        });

        it('redirects unauthenticated to login', function () {
            $response = $this->get('/admin/syscom/brands');

            $response->assertRedirect('/login');
        });
    });

    describe('import', function () {
        it('imports single brand successfully', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getBrands')
                ->andReturn([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 0,
                    'per_page' => 15,
                ]);

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->post('/admin/syscom/brands/import', [
                'brands' => [
                    ['syscom_id' => 'tp-link', 'name' => 'TP-Link'],
                ],
            ]);

            $response->assertRedirect()
                ->assertSessionHas('success');

            $this->assertDatabaseHas('brands', [
                'name' => 'TP-Link',
                'slug' => 'tp-link',
            ]);
        });

        it('imports multiple brands in batch', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->post('/admin/syscom/brands/import', [
                'brands' => [
                    ['syscom_id' => 'tp-link', 'name' => 'TP-Link'],
                    ['syscom_id' => 'netgear', 'name' => 'Netgear'],
                    ['syscom_id' => 'ubiquiti', 'name' => 'Ubiquiti'],
                ],
            ]);

            $response->assertRedirect()
                ->assertSessionHas('success');

            $this->assertDatabaseHas('brands', ['name' => 'TP-Link', 'slug' => 'tp-link']);
            $this->assertDatabaseHas('brands', ['name' => 'Netgear', 'slug' => 'netgear']);
            $this->assertDatabaseHas('brands', ['name' => 'Ubiquiti', 'slug' => 'ubiquiti']);
        });

        it('skips already-imported brands (duplicates)', function () {
            Brand::factory()->create([
                'name' => 'TP-Link Existing',
                'slug' => 'tp-link',
                'metadata' => ['syscom_id' => 'tp-link'],
            ]);

            $mockService = Mockery::mock(SyscomService::class);
            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->post('/admin/syscom/brands/import', [
                'brands' => [
                    ['syscom_id' => 'tp-link', 'name' => 'TP-Link'],
                    ['syscom_id' => 'netgear', 'name' => 'Netgear'],
                ],
            ]);

            $response->assertRedirect()
                ->assertSessionHas('success');

            $this->assertDatabaseCount('brands', 2);
        });

        it('fails when more than 50 brands provided', function () {
            $brands = array_map(
                fn ($i) => ['syscom_id' => "brand-{$i}", 'name' => "Brand {$i}"],
                range(1, 51),
            );

            $response = $this->actingAs($this->admin)->postJson('/admin/syscom/brands/import', [
                'brands' => $brands,
            ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['brands']);
        });

        it('fails when brands is empty', function () {
            $response = $this->actingAs($this->admin)->postJson('/admin/syscom/brands/import', [
                'brands' => [],
            ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['brands']);
        });

        it('denies non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);

            $response = $this->actingAs($user)->postJson('/admin/syscom/brands/import', [
                'brands' => [['syscom_id' => 'tp-link', 'name' => 'TP-Link']],
            ]);

            $response->assertForbidden();
        });

        it('redirects unauthenticated to login', function () {
            $response = $this->postJson('/admin/syscom/brands/import', [
                'brands' => [['syscom_id' => 'tp-link', 'name' => 'TP-Link']],
            ]);

            $response->assertUnauthorized();
        });
    });
});
