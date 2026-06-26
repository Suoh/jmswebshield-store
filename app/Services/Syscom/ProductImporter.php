<?php

namespace App\Services\Syscom;

use App\Models\Brand;
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

        $brandsData = $this->syscomService->getBrands(1);
        $brandLookup = [];
        foreach ($brandsData['data'] ?? [] as $brand) {
            $brandLookup[$brand['id']] = $brand['nombre'];
        }

        $existingSyscomIds = Product::importedSyscomIds()->flip()->toArray();

        $localBrands = Brand::whereHasSyscomId()
            ->get()
            ->keyBy(fn ($b) => $b->metadata['syscom_id'] ?? '');

        DB::transaction(function () use (
            $products,
            &$imported,
            &$skipped,
            &$failed,
            $existingSyscomIds,
            $brandLookup,
            &$localBrands,
        ) {
            foreach ($products as $item) {
                $productoId = $item['producto_id'];
                $adminPrice = (float) $item['price'];

                if (isset($existingSyscomIds[$productoId])) {
                    $skipped++;

                    continue;
                }

                try {
                    $localData = $this->syscomService->getProductDetail($productoId, $adminPrice);
                } catch (\Exception $e) {
                    $failed++;

                    continue;
                }

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
                Product::create($localData);

                $existingSyscomIds[$productoId] = true;
                $imported++;
            }
        });

        return ['imported' => $imported, 'skipped' => $skipped, 'failed' => $failed];
    }
}
