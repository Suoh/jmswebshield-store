<?php

namespace Tests\Feature\Controllers\Admin\Syscom;

use App\Models\Brand;
use App\Models\Product;
use App\Models\User;
use App\Services\Syscom\SyscomService;
use Mockery;

beforeEach(fn () => actingAsAdmin());

describe('Syscom Product Import Controller', function () {
    describe('index', function () {
        it('renders page with paginated SYSCOM products', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')
                ->once()
                ->andReturn([
                    ['id' => '1', 'nombre' => 'Routers'],
                    ['id' => '2', 'nombre' => 'Switches'],
                ]);
            $mockService->shouldReceive('getBrands')
                ->with(1)
                ->once()
                ->andReturn([
                    'data' => [
                        ['id' => 'tp-link', 'nombre' => 'TP-Link'],
                        ['id' => 'netgear', 'nombre' => 'Netgear'],
                    ],
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 2,
                ]);
            $mockService->shouldReceive('getProducts')
                ->with(['categoria' => '1'], 1)
                ->once()
                ->andReturn([
                    'data' => [
                        [
                            'id' => 'prod-001',
                            'nombre' => 'Router WiFi 6',
                            'descripcion_corta' => 'Dual band router',
                            'stock' => 10,
                            'modelo' => 'R6700',
                            'marca_id' => 'netgear',
                            'precios' => ['precio_lista' => 150.00, 'precio_descuento' => 135.00],
                            'imagen' => 'https://syscom.com/img1.jpg',
                        ],
                    ],
                    'current_page' => 1,
                    'last_page' => 5,
                    'total' => 100,
                    'per_page' => 20,
                ]);

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->get('/admin/syscom/products?categoria_id=1');

            $response->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component('admin/syscom/products/index')
                    ->has('syscom_products.data', 1)
                    ->has('categories', 2)
                    ->has('brands', 2)
                    ->where('syscom_products.current_page', 1)
                    ->where('syscom_products.total', 100)
                    ->has('imported_syscom_ids')
                );
        });

        it('returns empty products when no category filter is provided', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')
                ->once()
                ->andReturn([
                    ['id' => '1', 'nombre' => 'Routers'],
                    ['id' => '2', 'nombre' => 'Switches'],
                ]);
            $mockService->shouldReceive('getBrands')
                ->with(1)
                ->once()
                ->andReturn([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 0,
                ]);
            $mockService->shouldNotReceive('getProducts');

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->get('/admin/syscom/products');

            $response->assertOk();
        });

        it('passes filters to getProducts with SYSCOM param names', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')->andReturn([]);
            $mockService->shouldReceive('getBrands')->andReturn(['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0]);
            $mockService->shouldReceive('getProducts')
                ->with(['categoria' => '5', 'marca' => 'tp-link', 'busqueda' => 'router', 'stock' => '1'], 2)
                ->once()
                ->andReturn([
                    'data' => [],
                    'current_page' => 2,
                    'last_page' => 1,
                    'total' => 0,
                    'per_page' => 20,
                ]);

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->get('/admin/syscom/products?categoria_id=5&marca_id=tp-link&search=router&stock=true&page=2');

            $response->assertOk();
        });

        it('maps stock false to 0 for SYSCOM API', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')->andReturn([]);
            $mockService->shouldReceive('getBrands')->andReturn(['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0]);
            $mockService->shouldReceive('getProducts')
                ->with(['categoria' => '1', 'stock' => '0'], 1)
                ->once()
                ->andReturn([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 0,
                    'per_page' => 20,
                ]);

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->get('/admin/syscom/products?categoria_id=1&stock=false');

            $response->assertOk();
        });

        it('denies access to non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);

            $response = $this->actingAs($user)->get('/admin/syscom/products');

            $response->assertForbidden();
        });

        it('redirects unauthenticated to login', function () {
            $response = $this->get('/admin/syscom/products');

            $response->assertRedirect('/login');
        });
    });

    describe('import', function () {
        it('imports single product successfully', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')->andReturn([]);
            $mockService->shouldReceive('getBrands')
                ->with(1)
                ->once()
                ->andReturn([
                    'data' => [
                        ['id' => 'netgear', 'nombre' => 'Netgear'],
                    ],
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 1,
                ]);
            $mockService->shouldReceive('getProductDetail')
                ->with('prod-001', 120.00)
                ->once()
                ->andReturn([
                    'name' => 'Router WiFi 6',
                    'short_description' => 'Dual band router',
                    'full_description' => 'High performance router',
                    'stock' => 10,
                    'price' => '120.00',
                    'model' => 'R6700',
                    'image_url' => 'https://syscom.com/img1.jpg',
                    'brand_id' => null,
                    'is_active' => true,
                    'metadata' => [
                        'syscom_id' => 'prod-001',
                        'syscom_marca_id' => 'netgear',
                        'syscom_precios' => ['precio_lista' => 150.00, 'precio_descuento' => 135.00],
                    ],
                ]);

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->post('/admin/syscom/products/import', [
                'products' => [
                    ['producto_id' => 'prod-001', 'price' => 120.00],
                ],
            ]);

            $response->assertRedirect()
                ->assertSessionHas('success');

            $this->assertDatabaseHas('products', [
                'name' => 'Router WiFi 6',
                'price' => '120.00',
                'stock' => 10,
                'model' => 'R6700',
            ]);

            $this->assertDatabaseHas('brands', [
                'name' => 'Netgear',
                'slug' => 'netgear',
            ]);
        });

        it('imports multiple products in batch', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')->andReturn([]);
            $mockService->shouldReceive('getBrands')
                ->with(1)
                ->once()
                ->andReturn([
                    'data' => [
                        ['id' => 'tp-link', 'nombre' => 'TP-Link'],
                        ['id' => 'netgear', 'nombre' => 'Netgear'],
                    ],
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 2,
                ]);
            $mockService->shouldReceive('getProductDetail')
                ->with('prod-001', 80.00)
                ->once()
                ->andReturn([
                    'name' => 'Router 1',
                    'short_description' => null,
                    'full_description' => null,
                    'stock' => 5,
                    'price' => '80.00',
                    'model' => 'M1',
                    'image_url' => null,
                    'brand_id' => null,
                    'is_active' => true,
                    'metadata' => [
                        'syscom_id' => 'prod-001',
                        'syscom_marca_id' => 'tp-link',
                        'syscom_precios' => ['precio_lista' => 100.00, 'precio_descuento' => 90.00],
                    ],
                ]);
            $mockService->shouldReceive('getProductDetail')
                ->with('prod-002', 160.00)
                ->once()
                ->andReturn([
                    'name' => 'Router 2',
                    'short_description' => null,
                    'full_description' => null,
                    'stock' => 3,
                    'price' => '160.00',
                    'model' => 'M2',
                    'image_url' => null,
                    'brand_id' => null,
                    'is_active' => true,
                    'metadata' => [
                        'syscom_id' => 'prod-002',
                        'syscom_marca_id' => 'netgear',
                        'syscom_precios' => ['precio_lista' => 200.00, 'precio_descuento' => 180.00],
                    ],
                ]);

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->post('/admin/syscom/products/import', [
                'products' => [
                    ['producto_id' => 'prod-001', 'price' => 80.00],
                    ['producto_id' => 'prod-002', 'price' => 160.00],
                ],
            ]);

            $response->assertRedirect()
                ->assertSessionHas('success');

            $this->assertDatabaseHas('products', ['name' => 'Router 1', 'price' => '80.00']);
            $this->assertDatabaseHas('products', ['name' => 'Router 2', 'price' => '160.00']);
        });

        it('skips already-imported products', function () {
            Brand::factory()->create([
                'name' => 'TP-Link',
                'slug' => 'tp-link',
                'metadata' => ['syscom_id' => 'tp-link'],
            ]);
            Product::factory()->create([
                'name' => 'Already Imported',
                'metadata' => ['syscom_id' => 'prod-001'],
            ]);

            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')->andReturn([]);
            $mockService->shouldReceive('getBrands')
                ->andReturn(['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0]);

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->post('/admin/syscom/products/import', [
                'products' => [
                    ['producto_id' => 'prod-001', 'price' => 120.00],
                ],
            ]);

            $response->assertRedirect()
                ->assertSessionHas('success');

            $this->assertDatabaseCount('products', 1);
        });

        it('skips failed products and continues batch import', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')->andReturn([]);
            $mockService->shouldReceive('getBrands')
                ->andReturn(['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0]);
            $mockService->shouldReceive('getProductDetail')
                ->with('prod-001', 80.00)
                ->once()
                ->andThrow(new \Exception('SYSCOM API error'));
            $mockService->shouldReceive('getProductDetail')
                ->with('prod-002', 160.00)
                ->once()
                ->andReturn([
                    'name' => 'Router 2',
                    'short_description' => null,
                    'full_description' => null,
                    'stock' => 3,
                    'price' => 160.00,
                    'model' => 'M2',
                    'image_url' => null,
                    'brand_id' => null,
                    'is_active' => true,
                    'metadata' => [
                        'syscom_id' => 'prod-002',
                        'syscom_marca_id' => null,
                        'syscom_precios' => ['precio_lista' => 200.00, 'precio_descuento' => 180.00],
                    ],
                ]);

            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->post('/admin/syscom/products/import', [
                'products' => [
                    ['producto_id' => 'prod-001', 'price' => 80.00],
                    ['producto_id' => 'prod-002', 'price' => 160.00],
                ],
            ]);

            $response->assertRedirect()
                ->assertSessionHas('success');

            $this->assertDatabaseHas('products', ['name' => 'Router 2']);
            $this->assertDatabaseMissing('products', ['name' => 'Router 1']);
        });

        it('fails when price is missing', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')->andReturn([]);
            $mockService->shouldReceive('getBrands')->andReturn(['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0]);
            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->postJson('/admin/syscom/products/import', [
                'products' => [
                    ['producto_id' => 'prod-001'],
                ],
            ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['products.0.price']);
        });

        it('fails when price is negative', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')->andReturn([]);
            $mockService->shouldReceive('getBrands')->andReturn(['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0]);
            $this->app->instance(SyscomService::class, $mockService);

            $response = $this->actingAs($this->admin)->postJson('/admin/syscom/products/import', [
                'products' => [
                    ['producto_id' => 'prod-001', 'price' => -50.00],
                ],
            ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['products.0.price']);
        });

        it('fails when more than 50 products provided', function () {
            $mockService = Mockery::mock(SyscomService::class);
            $mockService->shouldReceive('getCategories')->andReturn([]);
            $mockService->shouldReceive('getBrands')->andReturn(['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0]);
            $this->app->instance(SyscomService::class, $mockService);

            $products = array_map(
                fn ($i) => ['producto_id' => "prod-{$i}", 'price' => 10.00],
                range(1, 51),
            );

            $response = $this->actingAs($this->admin)->postJson('/admin/syscom/products/import', [
                'products' => $products,
            ]);

            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['products']);
        });

        it('denies non-admin users', function () {
            $user = User::factory()->create(['email' => 'user@test.com']);

            $response = $this->actingAs($user)->postJson('/admin/syscom/products/import', [
                'products' => [
                    ['producto_id' => 'prod-001', 'price' => 120.00],
                ],
            ]);

            $response->assertForbidden();
        });

        it('redirects unauthenticated to login', function () {
            $response = $this->postJson('/admin/syscom/products/import', [
                'products' => [
                    ['producto_id' => 'prod-001', 'price' => 120.00],
                ],
            ]);

            $response->assertUnauthorized();
        });
    });
});
