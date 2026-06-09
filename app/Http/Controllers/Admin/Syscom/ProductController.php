<?php

namespace App\Http\Controllers\Admin\Syscom;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use App\Services\Syscom\SyscomService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private SyscomService $syscomService,
    ) {}

    public function index(Request $request): Response
    {
        $filters = array_filter([
            'categoria' => $request->query('categoria_id'),
            'marca' => $request->query('marca_id'),
            'busqueda' => $request->query('search'),
            'stock' => $request->query('stock'),
        ]);

        $page = (int) $request->query('page', 1);

        $categories = $this->syscomService->getCategories();

        $brandsData = $this->syscomService->getBrands(1);
        $brands = $brandsData['data'] ?? [];

        if (
            empty($filters)
            && ! empty($categories)
        ) {
            $filters['categoria'] = $categories[0]['id'];
        }

        $syscomProducts = $this->syscomService->getProducts($filters, $page);

        $importedSyscomIds = Product::query()
            ->whereNotNull('metadata')
            ->whereRaw("json_extract(metadata, '$.syscom_id') IS NOT NULL")
            ->get()
            ->pluck('metadata.syscom_id')
            ->filter()
            ->values()
            ->all();

        return Inertia::render('admin/syscom/products/index', [
            'syscom_products' => $syscomProducts,
            'categories' => $categories,
            'brands' => $brands,
            'imported_syscom_ids' => $importedSyscomIds,
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'products' => 'required|array|min:1|max:50',
            'products.*.producto_id' => 'required|string',
            'products.*.price' => 'required|numeric|min:0.01',
        ]);

        $products = $validated['products'];
        $imported = 0;
        $skipped = 0;
        $failed = 0;

        $brandsData = $this->syscomService->getBrands(1);
        $brandLookup = [];
        foreach ($brandsData['data'] ?? [] as $brand) {
            $brandLookup[$brand['id']] = $brand['nombre'];
        }

        $existingSyscomIds = Product::query()
            ->whereNotNull('metadata')
            ->whereRaw("json_extract(metadata, '$.syscom_id') IS NOT NULL")
            ->get()
            ->pluck('metadata.syscom_id')
            ->filter()
            ->flip()
            ->toArray();

        $localBrands = Brand::query()
            ->whereNotNull('metadata')
            ->whereRaw("json_extract(metadata, '$.syscom_id') IS NOT NULL")
            ->get()
            ->keyBy(fn ($b) => $b->metadata['syscom_id'] ?? '');

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

        return response()->json([
            'imported' => $imported,
            'skipped' => $skipped,
            'failed' => $failed,
        ]);
    }
}
