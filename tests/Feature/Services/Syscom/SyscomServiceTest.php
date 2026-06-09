<?php

namespace Tests\Feature\Services\Syscom;

use App\Services\Syscom\SyscomClient;
use App\Services\Syscom\SyscomService;
use Mockery;

beforeEach(function () {
    $this->withoutVite();
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
        it('normalizes flat array from SYSCOM API to PaginatedData', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getBrands')
                ->with(1)
                ->once()
                ->andReturn([
                    ['id' => 'tp-link', 'nombre' => 'TP-Link'],
                    ['id' => 'netgear', 'nombre' => 'Netgear'],
                ]);

            $service = new SyscomService($mockClient);
            $result = $service->getBrands(1);

            expect($result)->toHaveKey('data')
                ->toHaveKey('current_page', 1)
                ->toHaveKey('last_page', 1)
                ->toHaveKey('total', 2)
                ->and($result['data'])->toHaveCount(2);
        });

        it('passes page parameter to client', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getBrands')
                ->with(3)
                ->once()
                ->andReturn([
                    ['id' => 'brand-a', 'nombre' => 'Brand A'],
                ]);

            $service = new SyscomService($mockClient);
            $result = $service->getBrands(3);

            expect($result['data'][0]['id'])->toBe('brand-a');
        });
    });

    describe('getProducts', function () {
        it('normalizes Búsqueda schema from SYSCOM API to PaginatedData', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getProducts')
                ->with([], 1)
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
                ->with(['categoria_id' => '5', 'stock' => 'true'], 2)
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

    describe('getProductDetail', function () {
        it('returns mapped product with admin price applied', function () {
            $mockClient = Mockery::mock(SyscomClient::class);
            $mockClient->shouldReceive('getProductDetail')
                ->with('12345')
                ->once()
                ->andReturn([
                    'producto_id' => '12345',
                    'titulo' => 'Router Premium',
                    'descripcion' => 'Sistema mesh de alta velocidad',
                    'total_existencia' => 15,
                    'modelo' => 'RBK953',
                    'marca' => 'tp-link',
                    'categoria_id' => '1',
                    'precios' => [
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
                ->and($result['metadata'])->toHaveKey('syscom_precios')
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
                    'descripcion' => null,
                    'total_existencia' => 1,
                    'modelo' => null,
                    'marca' => null,
                    'categoria_id' => null,
                    'precios' => [
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
