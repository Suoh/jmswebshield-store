<?php

namespace App\Http\Controllers\Admin\Syscom;

use App\Enums\ImportStatus;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Syscom\ProductImporter;
use App\Services\Syscom\SyscomService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private SyscomService $syscomService,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $filters = array_filter([
            'categoria' => $request->query('categoria_id'),
            'marca' => $request->query('marca_id'),
            'busqueda' => $request->query('search'),
            'stock' => $request->query('stock'),
        ]);

        if (isset($filters['stock'])) {
            $filters['stock'] = $filters['stock'] === 'true' ? '1' : '0';
        }

        $page = (int) $request->query('page', 1);

        $categories = $this->syscomService->getCategories();

        $brandsData = $this->syscomService->getBrands(1);
        $brands = $brandsData['data'] ?? [];

        if (
            empty($filters)
            && ! empty($categories)
        ) {
            return redirect()->route('admin.syscom.products.index', [
                'categoria_id' => $categories[0]['id'],
            ]);
        }

        $syscomProducts = $this->syscomService->getProducts($filters, $page);

        $importedSyscomIds = Product::importedSyscomIds()->all();

        return Inertia::render('admin/syscom/products/index', [
            'syscom_products' => $syscomProducts,
            'categories' => $categories,
            'brands' => $brands,
            'imported_syscom_ids' => $importedSyscomIds,
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'products' => 'required|array|min:1|max:50',
            'products.*.producto_id' => 'required|string',
            'products.*.price' => 'required|numeric|min:0.01',
        ]);

        $result = app(ProductImporter::class)->import($validated['products']);

        $imported = $result[ImportStatus::Imported->value];
        $skipped = $result[ImportStatus::Skipped->value];
        $failed = $result[ImportStatus::Failed->value];

        return back()->with('success', "Productos importados: $imported, omitidos: $skipped, fallidos: $failed.");
    }
}
