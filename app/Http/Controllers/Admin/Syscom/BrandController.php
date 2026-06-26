<?php

namespace App\Http\Controllers\Admin\Syscom;

use App\Enums\ImportStatus;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Services\Syscom\BrandImporter;
use App\Services\Syscom\SyscomService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function __construct(
        private SyscomService $syscomService,
    ) {}

    public function index(Request $request): Response
    {
        $page = (int) $request->query('page', 1);

        $syscomBrands = $this->syscomService->getBrands($page);

        $importedSyscomIds = Brand::importedSyscomIds()->all();

        return Inertia::render('admin/syscom/brands/index', [
            'syscom_brands' => $syscomBrands,
            'imported_syscom_ids' => $importedSyscomIds,
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'brands' => 'required|array|min:1|max:50',
            'brands.*.syscom_id' => 'required|string',
            'brands.*.name' => 'required|string',
        ]);

        $result = app(BrandImporter::class)->import($validated['brands']);

        $imported = $result[ImportStatus::Imported->value];
        $skipped = $result[ImportStatus::Skipped->value];

        return back()->with('success', "Marcas importadas: $imported, omitidas: $skipped.");
    }
}
