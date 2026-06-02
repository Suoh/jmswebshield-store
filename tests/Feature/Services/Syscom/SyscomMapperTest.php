<?php

namespace Tests\Feature\Services\Syscom;

use App\Services\Syscom\SyscomMapper;

beforeEach(function () {
    $this->withoutVite();
});

describe('SyscomMapper', function () {
    describe('toLocalBrand', function () {
        it('maps syscom brand response to local brand array', function () {
            $syscomBrand = [
                'id' => 'tp-link',
                'nombre' => 'TP-Link',
            ];

            $result = SyscomMapper::toLocalBrand($syscomBrand);

            expect($result)->toBeArray()
                ->toHaveKey('name', 'TP-Link')
                ->toHaveKey('slug', 'tp-link')
                ->toHaveKey('metadata')
                ->and($result['metadata'])->toBeArray()
                ->toHaveKey('syscom_id', 'tp-link');
        });

        it('generates slug from syscom brand name', function () {
            $syscomBrand = [
                'id' => 'netgear-inc',
                'nombre' => 'Netgear Inc.',
            ];

            $result = SyscomMapper::toLocalBrand($syscomBrand);

            expect($result['slug'])->toBe('netgear-inc');
        });
    });

    describe('toLocalProduct', function () {
        it('maps syscom product response to local array with admin price', function () {
            $syscomProduct = [
                'id' => '12345',
                'nombre' => 'Router Wifi 6',
                'descripcion_corta' => 'Router dual band',
                'descripcion_larga' => 'Router WiFi 6 con beamforming',
                'stock' => 50,
                'modelo' => 'RBK852',
                'marca_id' => 'tp-link',
                'categoria_id' => '1',
                'precios' => [
                    'precio_lista' => 1500.00,
                    'precio_descuento' => 1350.00,
                ],
                'imagen' => 'https://syscom-api.com/images/router.jpg',
            ];

            $result = SyscomMapper::toLocalProduct($syscomProduct, 1200.00);

            expect($result)->toBeArray()
                ->toHaveKey('name', 'Router Wifi 6')
                ->toHaveKey('short_description', 'Router dual band')
                ->toHaveKey('full_description', 'Router WiFi 6 con beamforming')
                ->toHaveKey('stock', 50)
                ->toHaveKey('price', '1200.00')
                ->toHaveKey('model', 'RBK852')
                ->toHaveKey('image_url', 'https://syscom-api.com/images/router.jpg')
                ->toHaveKey('metadata')
                ->and($result['metadata'])->toBeArray()
                ->toHaveKey('syscom_id', '12345')
                ->toHaveKey('syscom_precios')
                ->and($result['metadata']['syscom_precios'])->toBeArray()
                ->toHaveKey('precio_lista', 1500.00)
                ->toHaveKey('precio_descuento', 1350.00);
        });

        it('uses admin price not syscom price', function () {
            $syscomProduct = [
                'id' => '99999',
                'nombre' => 'Producto Caro',
                'descripcion_corta' => null,
                'descripcion_larga' => null,
                'stock' => 10,
                'modelo' => 'MODEL-X',
                'marca_id' => null,
                'categoria_id' => null,
                'precios' => [
                    'precio_lista' => 9999.99,
                    'precio_descuento' => 8999.99,
                ],
                'imagen' => null,
            ];

            $result = SyscomMapper::toLocalProduct($syscomProduct, 450.00);

            expect($result['price'])->toBe('450.00');
            expect($result['price'])->not->toBe('9999.99');
        });

        it('sets is_active to true', function () {
            $syscomProduct = [
                'id' => '1',
                'nombre' => 'Test Product',
                'descripcion_corta' => null,
                'descripcion_larga' => null,
                'stock' => 5,
                'modelo' => null,
                'marca_id' => null,
                'categoria_id' => null,
                'precios' => [
                    'precio_lista' => 100.00,
                    'precio_descuento' => 90.00,
                ],
                'imagen' => null,
            ];

            $result = SyscomMapper::toLocalProduct($syscomProduct, 80.00);

            expect($result)->toHaveKey('is_active', true);
        });

        it('includes syscom_id in metadata', function () {
            $syscomProduct = [
                'id' => 'abc-123-xyz',
                'nombre' => 'Product with custom ID',
                'descripcion_corta' => null,
                'descripcion_larga' => null,
                'stock' => 1,
                'modelo' => null,
                'marca_id' => null,
                'categoria_id' => null,
                'precios' => [
                    'precio_lista' => 100.00,
                    'precio_descuento' => 100.00,
                ],
                'imagen' => null,
            ];

            $result = SyscomMapper::toLocalProduct($syscomProduct, 100.00);

            expect($result['metadata'])->toHaveKey('syscom_id', 'abc-123-xyz');
        });
    });
});
