<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:brands,name',
        ]);

        Brand::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->route('admin.brands.index');
    }

    public function edit(int $id): Response
    {
        $brand = Brand::withCount('products')->findOrFail($id);

        return Inertia::render('admin/brands/[id]/edit', [
            'brand' => $brand,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $brand = Brand::findOrFail($id);

        $validated = $request->validate([
            'name' => "required|string|max:255|unique:brands,name,{$id}",
        ]);

        $brand->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->route('admin.brands.index');
    }

    public function destroy(int $id): RedirectResponse
    {
        $brand = Brand::findOrFail($id);

        if ($brand->products()->exists()) {
            return abort(409, 'No se puede eliminar una marca que tiene productos asociados.');
        }

        $brand->delete();

        return redirect()->route('admin.brands.index');
    }
}