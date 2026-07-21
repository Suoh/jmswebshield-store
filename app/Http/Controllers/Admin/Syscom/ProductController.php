<?php

namespace App\Http\Controllers\Admin\Syscom;

use App\Enums\ImportStatus;
use App\Exceptions\Syscom\SyscomApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Syscom\ImportProductsRequest;
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
        try {
            $categories = $this->syscomService->getCategories();
            $brands = $this->syscomService->getBrands();
        } catch (SyscomApiException $e) {
            session()->flash('error', 'No se pudo conectar con SYSCOM. Intentalo de nuevo más tarde.');

            return Inertia::render('admin/syscom/products/index', [
                'syscom_products' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'links' => [],
                ],
                'categories' => [],
                'brands' => [],
                'imported_syscom_ids' => Product::importedSyscomIds()->all(),
            ]);
        }

        $categoriaIds = $request->query('categoria_ids', '');

        if ($categoriaIds === '') {
            if (! empty($categories)) {
                return redirect()->to('/admin/syscom/products?categoria_ids='.$categories[0]['id']);
            }

            $syscomProducts = [
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'links' => [],
            ];
        } else {
            $filters = array_filter([
                'categoria' => $categoriaIds,
                'marca' => $request->query('marca_id'),
                'busqueda' => $request->query('search'),
                'stock' => $request->query('stock'),
                'limit' => 20,
            ]);

            if (isset($filters['stock'])) {
                $filters['stock'] = $filters['stock'] === 'true' ? '1' : '0';
            }

            $page = (int) $request->query('page', 1);

            try {
                $syscomProducts = $this->syscomService->getProducts($filters, $page);
            } catch (SyscomApiException $e) {
                session()->flash('error', 'No se pudieron cargar los productos de SYSCOM. Intentalo de nuevo más tarde.');

                $syscomProducts = [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'links' => [],
                ];
            }
        }

        $importedSyscomIds = Product::importedSyscomIds()->all();

        return Inertia::render('admin/syscom/products/index', [
            'syscom_products' => $syscomProducts,
            'categories' => $categories,
            'brands' => $brands,
            'imported_syscom_ids' => $importedSyscomIds,
        ]);
    }

    public function import(ImportProductsRequest $request): RedirectResponse
    {
        $result = app(ProductImporter::class)->import($request->validated('products'));

        $imported = $result[ImportStatus::Imported->value];
        $skipped = $result[ImportStatus::Skipped->value];
        $failed = $result[ImportStatus::Failed->value];

        return back()->with('success', "Productos importados: $imported, omitidos: $skipped, fallidos: $failed.");
    }
}
