<?php

namespace App\Services\Syscom;

class SyscomService
{
    private SyscomClient $client;

    public function __construct(SyscomClient $client)
    {
        $this->client = $client;
    }

    public function getCategories(): array
    {
        return $this->client->getCategories();
    }

    public function getBrands(int $page = 1): array
    {
        $raw = $this->client->getBrands($page);

        return $this->normalizeBrandsResponse($raw);
    }

    public function getProducts(array $filters = [], int $page = 1): array
    {
        $raw = $this->client->getProducts($filters, $page);

        return $this->normalizeProductsResponse($raw);
    }

    public function getProductDetail(string $id, float $adminPrice): array
    {
        $rawProduct = $this->client->getProductDetail($id);

        return SyscomMapper::toLocalProduct($rawProduct, $adminPrice);
    }

    private function normalizeBrandsResponse(array $raw): array
    {
        if (array_is_list($raw)) {
            return [
                'data' => $raw,
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
        return $this->normalizeBusquedaResponse($raw);
    }

    private function normalizeBusquedaResponse(array $raw): array
    {
        $items = $raw['productos'] ?? [];

        return [
            'data' => $items,
            'current_page' => (int) ($raw['pagina'] ?? 1),
            'last_page' => (int) ($raw['paginas'] ?? 1),
            'total' => (int) ($raw['cantidad'] ?? 0),
            'per_page' => count($items),
            'links' => [],
        ];
    }
}
