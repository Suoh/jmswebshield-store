<?php

namespace Tests\Feature\Services\Syscom;

use App\Services\Syscom\SyscomClient;
use App\Services\Syscom\SyscomService;
use Illuminate\Support\Facades\Cache;
use Mockery;

beforeEach(function () {
    $this->withoutVite();
    Cache::flush();
});

describe('SyscomService', function () {
    describe('getCategories', function () {
        it('returns categories array from client', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getCategories')
                ->once()
                ->andReturn([
                    ['id' => '1', 'nombre' => 'Routers'],
                    ['id' => '2', 'nombre' => 'Switches'],
                    ['id' => '3', 'nombre' => 'Access Points'],
                ]);

            $service = new SyscomService($mockClient);
            $result = $service->getCategories();

            expect($result)->toBeArray()
                ->toHaveCount(3)
                ->and($result[0])->toHaveKey('id', '1')
                ->and($result[0])->toHaveKey('nombre', 'Routers');
        });
    });

    describe('getBrands', function () {
        it('returns flat array from SYSCOM API', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getBrands')
                ->once()
                ->andReturn([
                    ['id' => 'tp-link', 'nombre' => 'TP-Link'],
                    ['id' => 'netgear', 'nombre' => 'Netgear'],
                ]);

            $service = new SyscomService($mockClient);
            $result = $service->getBrands();

            expect($result)->toBeArray()
                ->toHaveCount(2)
                ->and($result[0])->toHaveKey('id', 'tp-link')
                ->and($result[0])->toHaveKey('nombre', 'TP-Link');
        });
    });

    describe('getProducts', function () {
        it('normalizes Búsqueda schema from SYSCOM API to PaginatedData', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getProducts')
                ->with([], 1, 20)
                ->once()
                ->andReturn([
                    'cantidad' => 500,
                    'pagina' => 1,
                    'paginas' => 10,
                    'productos' => [
                        ['id' => '1', 'nombre' => 'Router 1'],
                    ],
                ]);

            $service = new SyscomService($mockClient);
            $result = $service->getProducts([], 1);

            expect($result)->toHaveKey('data')
                ->toHaveKey('current_page', 1)
                ->toHaveKey('last_page', 10)
                ->toHaveKey('total', 500)
                ->and($result['data'])->toHaveCount(1);
        });

        it('passes filters and page to client', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getProducts')
                ->with(['categoria_id' => '5', 'stock' => 'true'], 2, 20)
                ->once()
                ->andReturn([
                    'cantidad' => 0,
                    'pagina' => 2,
                    'paginas' => 1,
                    'productos' => [],
                ]);

            $service = new SyscomService($mockClient);
            $result = $service->getProducts(['categoria_id' => '5', 'stock' => 'true'], 2);

            expect($result)->toHaveKey('data')
                ->and($result['current_page'])->toBe(2);
        });
    });

    describe('caching', function () {
        it('caches getCategories for subsequent calls', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getCategories')
                ->once()
                ->andReturn([['id' => 'cat-1', 'nombre' => 'Category 1']]);

            $service = new SyscomService($mockClient);

            $first = $service->getCategories();
            $second = $service->getCategories();

            expect($first)->toBe($second)
                ->and($first)->toHaveCount(1)
                ->and($first[0]['id'])->toBe('cat-1');
        });

        it('caches getBrands for subsequent calls', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getBrands')
                ->once()
                ->andReturn([['id' => 'brand-cached', 'nombre' => 'Brand Cached']]);

            $service = new SyscomService($mockClient);

            $first = $service->getBrands();
            $second = $service->getBrands();

            expect($first)->toBe($second)
                ->and($first[0]['id'])->toBe('brand-cached');
        });
    });

    describe('getProductDetail', function () {
        it('returns mapped product with admin price applied', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getProductDetail')
                ->with('12345')
                ->once()
                ->andReturn([
                    'producto_id' => '12345',
                    'titulo' => 'Router Premium',
                    'sat_description' => 'Router de alta velocidad',
                    'descripcion' => 'Sistema mesh de alta velocidad',
                    'total_existencia' => 15,
                    'modelo' => 'RBK953',
                    'marca' => 'tp-link',
                    'categorias' => [['id' => 'cat-001', 'nombre' => 'Categoría A', 'nivel' => 1], ['id' => 'cat-002', 'nombre' => 'Categoría B', 'nivel' => 1]],
                    'precios' => [
                        'precio_1' => 21000.00,
                        'precio_especial' => 20500.00,
                        'precio_lista' => 20000.00,
                        'precio_descuento' => 18000.00,
                    ],
                    'img_portada' => 'https://syscom.com/router.jpg',
                ]);

            $service = new SyscomService($mockClient);
            $result = $service->getProductDetail('12345', 15500.00);

            expect($result)->toHaveKey('name', 'Router Premium')
                ->toHaveKey('price', '15500.00')
                ->toHaveKey('stock', 15)
                ->toHaveKey('model', 'RBK953')
                ->toHaveKey('is_active', true)
                ->and($result['metadata'])->toHaveKey('syscom_id', '12345')
                ->and($result['metadata'])->toHaveKey('syscom_categoria_ids', ['cat-001', 'cat-002'])
                ->and($result['metadata'])->toHaveKey('syscom_precios')
                ->and($result['metadata']['syscom_precios'])->toHaveKey('precio_1', 21000.00)
                ->and($result['metadata']['syscom_precios'])->toHaveKey('precio_especial', 20500.00)
                ->and($result['metadata']['syscom_precios'])->toHaveKey('precio_lista', 20000.00)
                ->and($result['metadata']['syscom_precios'])->toHaveKey('precio_descuento', 18000.00);
        });

        it('uses admin price not syscom list price', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getProductDetail')
                ->with('99999')
                ->once()
                ->andReturn([
                    'producto_id' => '99999',
                    'titulo' => 'Expensive Item',
                    'sat_description' => null,
                    'descripcion' => null,
                    'total_existencia' => 1,
                    'modelo' => null,
                    'marca' => null,
                    'categorias' => [],
                    'precios' => [
                        'precio_1' => 99999.99,
                        'precio_especial' => 94999.99,
                        'precio_lista' => 99999.99,
                        'precio_descuento' => 89999.99,
                    ],
                    'img_portada' => null,
                ]);

            $service = new SyscomService($mockClient);
            $result = $service->getProductDetail('99999', 500.00);

            expect($result['price'])->toBe(500.00)
                ->and($result['price'])->not->toBe(99999.99);
        });
    });
});
