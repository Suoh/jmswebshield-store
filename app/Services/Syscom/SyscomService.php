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
        return $this->client->getBrands($page);
    }

    public function getProducts(array $filters = [], int $page = 1): array
    {
        return $this->client->getProducts($filters, $page);
    }

    public function getProductDetail(string $id, float $adminPrice): array
    {
        $rawProduct = $this->client->getProductDetail($id);

        return SyscomMapper::toLocalProduct($rawProduct, $adminPrice);
    }
}
