<?php

namespace App\Services\Syscom;

use Illuminate\Support\Facades\Cache;

class SyscomService
{
    private SyscomClient $client;

    public function __construct(SyscomClient $client)
    {
        $this->client = $client;
    }

    public function getCategories(): array
    {
        return Cache::remember('syscom_categories', 3600, function () {
            return $this->client->getCategories();
        });
    }

    public function getBrands(): array
    {
        return Cache::remember('syscom_brands_all', 3600, function () {
            return $this->client->getBrands();
        });
    }

    public function getProducts(array $filters = [], int $page = 1, int $limit = 20): array
    {
        $raw = $this->client->getProducts($filters, $page, $limit);

        return $this->normalizeProductsResponse($raw);
    }

    public function getProductDetail(string $id, float $adminPrice): array
    {
        $rawProduct = $this->client->getProductDetail($id);
        $normalized = $this->normalizeProductDetail($rawProduct);

        return SyscomMapper::toLocalProduct($normalized, $adminPrice);
    }

    private function normalizeBrandsResponse(array $raw): array
    {
        if (array_is_list($raw)) {
            return array_map(function (array $brand): array {
                $brand['id'] = (string) ($brand['id'] ?? '');

                return $brand;
            }, $raw);
        }

        return $raw;
    }

    private function normalizeProductsResponse(array $raw): array
    {
        if (array_is_list($raw)) {
            return [
                'data' => array_map([$this, 'normalizeProductItem'], $raw),
                'current_page' => 1,
                'last_page' => 1,
                'total' => count($raw),
                'per_page' => count($raw),
                'links' => [],
            ];
        }

        return $this->normalizeBusquedaResponse($raw);
    }

    private function normalizeProductItem(array $item): array
    {
        $precios = $item['precios'] ?? null;

        if (is_array($precios)) {
            $precios = [
                'precio_1' => $precios['precio_1'] ?? null,
                'precio_especial' => $precios['precio_especial'] ?? null,
                'precio_lista' => $precios['precio_lista'] ?? null,
                'precio_descuento' => $precios['precio_descuento'] ?? null,
            ];
        }

        return [
            'id' => $item['producto_id'] ?? '',
            'nombre' => $item['titulo'] ?? '',
            'descripcion_corta' => $item['sat_description'] ?? null,
            'stock' => (int) ($item['total_existencia'] ?? 0),
            'modelo' => $item['modelo'] ?? null,
            'marca_id' => $item['marca'] ?? null,
            'precios' => $precios,
            'imagen' => $item['img_portada'] ?? null,
        ];
    }

    private function normalizeProductDetail(array $raw): array
    {
        $categorias = $raw['categorias'] ?? [];

        if (array_is_list($categorias)) {
            $categorias = array_map(fn ($cat) => match (true) {
                is_array($cat) => (string) ($cat['id'] ?? $cat['categoria_id'] ?? ''),
                default => (string) $cat,
            }, $categorias);
            $categorias = array_values(array_filter($categorias, fn ($id) => $id !== ''));
        }

        $precios = $raw['precios'] ?? null;

        if (is_array($precios)) {
            $precios = [
                'precio_1' => $precios['precio_1'] ?? null,
                'precio_especial' => $precios['precio_especial'] ?? null,
                'precio_lista' => $precios['precio_lista'] ?? null,
                'precio_descuento' => $precios['precio_descuento'] ?? null,
            ];
        }

        return [
            'id' => (string) ($raw['producto_id'] ?? ''),
            'nombre' => $raw['titulo'] ?? '',
            'descripcion_corta' => $raw['sat_description'] ?? null,
            'descripcion_larga' => $raw['descripcion'] ?? null,
            'stock' => (int) ($raw['total_existencia'] ?? 0),
            'modelo' => $raw['modelo'] ?? null,
            'marca_id' => strtolower((string) ($raw['marca'] ?? '')),
            'precios' => $precios,
            'imagen' => $raw['img_portada'] ?? null,
            'categorias' => $categorias,
        ];
    }

    private function normalizeBusquedaResponse(array $raw): array
    {
        $items = $raw['productos'] ?? [];

        return [
            'data' => array_map([$this, 'normalizeProductItem'], $items),
            'current_page' => (int) ($raw['pagina'] ?? 1),
            'last_page' => (int) ($raw['paginas'] ?? 1),
            'total' => (int) ($raw['cantidad'] ?? 0),
            'per_page' => count($items),
            'links' => [],
        ];
    }
}
