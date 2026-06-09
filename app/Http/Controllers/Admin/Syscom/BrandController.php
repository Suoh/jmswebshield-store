<?php

namespace App\Http\Controllers\Admin\Syscom;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Services\Syscom\SyscomMapper;
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

        $importedSyscomIds = Brand::query()
            ->whereNotNull('metadata')
            ->whereRaw("json_extract(metadata, '$.syscom_id') IS NOT NULL")
            ->get()
            ->pluck('metadata.syscom_id')
            ->reject(fn ($v) => $v === null || $v === '')
            ->values()
            ->all();

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

        $brands = $validated['brands'];
        $imported = 0;
        $skipped = 0;

        $existingSyscomIds = Brand::query()
            ->whereNotNull('metadata')
            ->whereRaw("json_extract(metadata, '$.syscom_id') IS NOT NULL")
            ->get()
            ->pluck('metadata.syscom_id')
            ->reject(fn ($v) => $v === null || $v === '')
            ->flip()
            ->toArray();

        foreach ($brands as $brand) {
            $syscomId = $brand['syscom_id'];
            $name = $brand['name'];

            if (isset($existingSyscomIds[$syscomId])) {
                $skipped++;

                continue;
            }

            $localData = SyscomMapper::toLocalBrand([
                'id' => $syscomId,
                'nombre' => $name,
            ]);

            Brand::create($localData);
            $existingSyscomIds[$syscomId] = true;
            $imported++;
        }

        return Inertia::flash('success', "Marcas importadas: $imported, omitidas: $skipped.")->back()->with('success', "Marcas importadas: $imported, omitidas: $skipped.");
    }
}
