<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BrandRequest;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(): Response
    {
        $brands = Brand::withCount('products')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('admin/brands/index', [
            'brands' => $brands,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/brands/create');
    }

    public function store(BrandRequest $request): RedirectResponse
    {
        Brand::create([
            'name' => $request->validated('name'),
            'slug' => Str::slug($request->validated('name')),
        ]);

        return redirect()->route('admin.brands.index')->with('success', 'Marca creada exitosamente.');
    }

    public function edit(int $id): Response
    {
        $brand = Brand::withCount('products')->findOrFail($id);

        return Inertia::render('admin/brands/[id]/edit', [
            'brand' => $brand,
        ]);
    }

    public function update(BrandRequest $request, int $id): RedirectResponse
    {
        $brand = Brand::findOrFail($id);

        $brand->update([
            'name' => $request->validated('name'),
            'slug' => Str::slug($request->validated('name')),
        ]);

        return redirect()->route('admin.brands.index')->with('success', 'Marca actualizada exitosamente.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $brand = Brand::findOrFail($id);

        if ($brand->products()->exists()) {
            return abort(409, 'No se puede eliminar una marca que tiene productos asociados.');
        }

        $brand->delete();

        return redirect()->route('admin.brands.index')->with('success', 'Marca eliminada.');
    }
}
