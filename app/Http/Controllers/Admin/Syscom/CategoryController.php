<?php

namespace App\Http\Controllers\Admin\Syscom;

use App\Enums\ImportStatus;
use App\Exceptions\Syscom\SyscomApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Syscom\ImportCategoriesRequest;
use App\Models\Category;
use App\Services\Syscom\CategoryImporter;
use App\Services\Syscom\SyscomService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        private SyscomService $syscomService,
    ) {}

    public function index(Request $request): Response
    {
        try {
            $syscomCategories = $this->syscomService->getCategories();
        } catch (SyscomApiException $e) {
            session()->flash('error', 'No se pudieron cargar las categorías de SYSCOM. Intentalo de nuevo más tarde.');

            $syscomCategories = [];
        }

        $importedSyscomIds = Category::importedSyscomIds()->all();

        return Inertia::render('admin/syscom/categories/index', [
            'syscom_categories' => $syscomCategories,
            'imported_syscom_ids' => $importedSyscomIds,
        ]);
    }

    public function import(ImportCategoriesRequest $request): RedirectResponse
    {
        $result = app(CategoryImporter::class)->import($request->validated('categories'));

        $imported = $result[ImportStatus::Imported->value];
        $skipped = $result[ImportStatus::Skipped->value];

        return back()->with('success', "Categorías importadas: $imported, omitidas: $skipped.");
    }
}
