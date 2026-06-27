<?php

namespace App\Http\Controllers\Admin\Syscom;

use App\Enums\ImportStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Syscom\ImportBrandsRequest;
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

    public function import(ImportBrandsRequest $request): RedirectResponse
    {
        $result = app(BrandImporter::class)->import($request->validated('brands'));

        $imported = $result[ImportStatus::Imported->value];
        $skipped = $result[ImportStatus::Skipped->value];

        return back()->with('success', "Marcas importadas: $imported, omitidas: $skipped.");
    }
}
