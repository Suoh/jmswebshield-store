<?php

namespace Tests\Feature\Services\Syscom;

use App\Models\Category;
use App\Models\Product;
use App\Services\Syscom\ProductImporter;
use App\Services\Syscom\SyscomClient;
use App\Services\Syscom\SyscomService;
use Illuminate\Support\Facades\Cache;
use Mockery;

beforeEach(function () {
    $this->withoutVite();
    Cache::flush();
    Category::query()->forceDelete();
    Product::query()->forceDelete();
});

describe('ProductImporter category attachment', function () {
    it('attaches categories to product after import', function () {
        Category::factory()->create([
            'name' => 'Redes',
            'slug' => 'cat-redes',
            'metadata' => ['syscom_id' => 'cat-001'],
        ]);
        Category::factory()->create([
            'name' => 'Audio',
            'slug' => 'cat-audio',
            'metadata' => ['syscom_id' => 'cat-002'],
        ]);

        $mockClient = Mockery::mock(SyscomClient::class);
        $mockClient->shouldReceive('getBrands')->andReturn(['data' => []]);
        $mockClient->shouldReceive('getCategories')->andReturn([
            ['id' => 'cat-001', 'nombre' => 'Redes'],
            ['id' => 'cat-002', 'nombre' => 'Audio'],
        ]);
        $mockClient->shouldReceive('getProductDetail')
            ->with('prod-001')
            ->once()
            ->andReturn([
                'producto_id' => 'prod-001',
                'titulo' => 'Switch Gigabit',
                'descripcion' => 'Switch 8 puertos',
                'total_existencia' => 10,
                'modelo' => 'SG108',
                'marca' => null,
                'categorias' => ['cat-001', 'cat-002'],
                'precios' => ['precio_lista' => 1500.00, 'precio_descuento' => null],
                'img_portada' => null,
            ]);

        $syscomService = new SyscomService($mockClient);
        $importer = new ProductImporter($syscomService);

        $result = $importer->import([['producto_id' => 'prod-001', 'price' => '1500.00']]);

        expect($result['imported'])->toBe(1)
            ->and($result['skipped'])->toBe(0)
            ->and($result['failed'])->toBe(0);

        $product = Product::first();
        expect($product->categories)->toHaveCount(2);
    });

    it('skips categories not found locally or in SYSCOM catalog', function () {
        Category::factory()->create([
            'name' => 'Redes',
            'slug' => 'cat-redes',
            'metadata' => ['syscom_id' => 'cat-001'],
        ]);

        $mockClient = Mockery::mock(SyscomClient::class);
        $mockClient->shouldReceive('getBrands')->andReturn(['data' => []]);
        $mockClient->shouldReceive('getCategories')->andReturn([
            ['id' => 'cat-001', 'nombre' => 'Redes'],
        ]);
        $mockClient->shouldReceive('getProductDetail')
            ->with('prod-001')
            ->once()
            ->andReturn([
                'producto_id' => 'prod-001',
                'titulo' => 'Producto sin categoría local',
                'descripcion' => null,
                'total_existencia' => 5,
                'modelo' => null,
                'marca' => null,
                'categorias' => ['cat-001', 'cat-unknown'],
                'precios' => ['precio_lista' => 1500.00, 'precio_descuento' => null],
                'img_portada' => null,
            ]);

        $syscomService = new SyscomService($mockClient);
        $importer = new ProductImporter($syscomService);

        $result = $importer->import([['producto_id' => 'prod-001', 'price' => '1500.00']]);

        expect($result['imported'])->toBe(1);

        $product = Product::first();
        expect($product->categories)->toHaveCount(1)
            ->and($product->categories->first()->metadata['syscom_id'])->toBe('cat-001');
    });

    it('auto-creates category from SYSCOM catalog when not imported yet', function () {
        $mockClient = Mockery::mock(SyscomClient::class);
        $mockClient->shouldReceive('getBrands')->andReturn(['data' => []]);
        $mockClient->shouldReceive('getCategories')->andReturn([
            ['id' => 'cat-new', 'nombre' => 'Almacenamiento'],
        ]);
        $mockClient->shouldReceive('getProductDetail')
            ->with('prod-001')
            ->once()
            ->andReturn([
                'producto_id' => 'prod-001',
                'titulo' => 'Disco NAS',
                'descripcion' => null,
                'total_existencia' => 3,
                'modelo' => null,
                'marca' => null,
                'categorias' => ['cat-new'],
                'precios' => ['precio_lista' => 1500.00, 'precio_descuento' => null],
                'img_portada' => null,
            ]);

        $syscomService = new SyscomService($mockClient);
        $importer = new ProductImporter($syscomService);

        $result = $importer->import([['producto_id' => 'prod-001', 'price' => '1500.00']]);

        expect($result['imported'])->toBe(1);

        $product = Product::first();
        expect($product->categories)->toHaveCount(1);

        $category = $product->categories->first();
        expect($category->name)->toBe('Almacenamiento')
            ->and($category->metadata['syscom_id'])->toBe('cat-new');
    });
});
