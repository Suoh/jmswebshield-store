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

    public function getBrands(int $page = 1): array
    {
        if ($page !== 1) {
            $raw = $this->client->getBrands($page);

            return $this->normalizeBrandsResponse($raw);
        }

        return Cache::remember('syscom_brands_all', 3600, function () {
            $raw = $this->client->getBrands(1);

            return $this->normalizeBrandsResponse($raw);
        });
    }

    public function getProducts(array $filters = [], int $page = 1): array
    {
        $raw = $this->client->getProducts($filters, $page);

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
            $normalized = array_map(function (array $brand): array {
                $brand['id'] = (string) ($brand['id'] ?? '');

                return $brand;
            }, $raw);

            return [
                'data' => $normalized,
                'current_page' => 1,
                'last_page' => 1,
                'total' => count($raw),
                'per_page' => count($raw),
                'links' => [],
            ];
        }

        if (isset($raw['productos'])) {
            return $this->normalizeBusquedaResponse($raw);
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
        return [
            'id' => $item['producto_id'] ?? '',
            'nombre' => $item['titulo'] ?? '',
            'descripcion_corta' => $item['sat_description'] ?? null,
            'stock' => (int) ($item['total_existencia'] ?? 0),
            'modelo' => $item['modelo'] ?? null,
            'marca_id' => $item['marca'] ?? null,
            'precios' => $item['precios'] ?? null,
            'imagen' => $item['img_portada'] ?? null,
        ];
    }

    private function normalizeProductDetail(array $raw): array
    {
        return [
            'id' => (string) ($raw['producto_id'] ?? ''),
            'nombre' => $raw['titulo'] ?? '',
            'descripcion_corta' => $raw['descripcion'] ?? null,
            'descripcion_larga' => $raw['descripcion'] ?? null,
            'stock' => (int) ($raw['total_existencia'] ?? 0),
            'modelo' => $raw['modelo'] ?? null,
            'marca_id' => strtolower($raw['marca'] ?? null),
            'precios' => $raw['precios'] ?? null,
            'imagen' => $raw['img_portada'] ?? null,
            'categorias' => $raw['categorias'] ?? [],
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
