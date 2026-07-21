<?php

namespace App\Services\Syscom;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductImporter
{
    public function __construct(
        private SyscomService $syscomService,
    ) {}

    public function import(array $products): array
    {
        $imported = 0;
        $skipped = 0;
        $failed = 0;

        $brandsData = $this->syscomService->getBrands();
        $brandLookup = [];
        foreach ($brandsData as $brand) {
            $brandLookup[$brand['id']] = $brand['nombre'];
        }

        $categoriesData = $this->syscomService->getCategories();
        $categoryLookup = [];
        foreach ($categoriesData as $category) {
            $categoryLookup[$category['id']] = $category['nombre'];
        }

        $existingSyscomIds = Product::importedSyscomIds()->flip()->toArray();

        $localBrands = Brand::whereHasSyscomId()
            ->get()
            ->keyBy(fn ($b) => $b->metadata['syscom_id'] ?? '');

        $localCategories = Category::whereHasSyscomId()
            ->get()
            ->keyBy(fn ($c) => $c->metadata['syscom_id'] ?? '');

        // Phase 1: fetch all product details outside DB transaction
        // This prevents holding a transaction open during slow HTTP calls
        $productDetails = [];
        foreach ($products as $item) {
            $productoId = (string) ($item['producto_id'] ?? '');
            $adminPrice = (float) $item['price'];

            if (isset($existingSyscomIds[$productoId]) || isset($productDetails[$productoId])) {
                $skipped++;

                continue;
            }

            try {
                $productDetails[$productoId] = $this->syscomService->getProductDetail($productoId, $adminPrice);
            } catch (\Exception $e) {
                $failed++;
            }
        }

        // Phase 2: DB writes inside a single transaction
        if ($productDetails === []) {
            return ['imported' => $imported, 'skipped' => $skipped, 'failed' => $failed];
        }

        DB::transaction(function () use (
            $productDetails,
            &$imported,
            &$failed,
            $brandLookup,
            &$localBrands,
            $categoryLookup,
            &$localCategories,
        ) {
            foreach ($productDetails as $productoId => $localData) {
                try {
                    $marcaId = $localData['metadata']['syscom_marca_id'] ?? null;
                    $brandId = null;

                    if ($marcaId) {
                        $brand = $localBrands->get($marcaId);
                        if (! $brand && isset($brandLookup[$marcaId])) {
                            $brandName = $brandLookup[$marcaId];
                            $brand = Brand::firstOrCreate(
                                ['slug' => $marcaId],
                                [
                                    'name' => $brandName,
                                    'metadata' => ['syscom_id' => $marcaId],
                                ],
                            );
                            $localBrands->put($marcaId, $brand);
                        }
                        $brandId = $brand?->id;
                    }

                    $localData['brand_id'] = $brandId;
                    $product = Product::create($localData);

                    $syscomCategoriaIds = $localData['metadata']['syscom_categoria_ids'] ?? [];
                    $categoryIds = [];

                    foreach ($syscomCategoriaIds as $catSyscomId) {
                        $category = $localCategories->get($catSyscomId);
                        if (! $category && isset($categoryLookup[$catSyscomId])) {
                            $categoryName = $categoryLookup[$catSyscomId];
                            $category = Category::firstOrCreate(
                                ['slug' => $catSyscomId],
                                [
                                    'name' => $categoryName,
                                    'metadata' => ['syscom_id' => $catSyscomId],
                                ],
                            );
                            $localCategories->put($catSyscomId, $category);
                        }
                        if ($category) {
                            $categoryIds[] = $category->id;
                        }
                    }

                    if ($categoryIds !== []) {
                        $product->categories()->attach($categoryIds);
                    }

                    $imported++;
                } catch (\Exception $e) {
                    $failed++;
                }
            }
        });

        return ['imported' => $imported, 'skipped' => $skipped, 'failed' => $failed];
    }
}
