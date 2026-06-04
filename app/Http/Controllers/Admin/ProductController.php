<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::with('brand')
            ->when(request('search'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when(request('brand_id'), fn ($q, $brandId) => $q->where('brand_id', $brandId))
            ->when(request('is_active') !== null, fn ($q) => $q->where('is_active', request('is_active') == '1'))
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $brands = Brand::orderBy('name')->get();

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'brands' => $brands,
        ]);
    }

    public function create(): Response
    {
        $brands = Brand::orderBy('name')->get();

        return Inertia::render('admin/products/create', [
            'brands' => $brands,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'discount' => 'nullable|integer|min:0|max:100',
            'sku' => 'nullable|string|unique:products,sku',
            'brand_id' => 'nullable|exists:brands,id',
            'model' => 'nullable|string',
            'image_url' => 'nullable|url',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        Product::create($validated);

        return redirect()->route('admin.products.index');
    }

    public function edit(int $id): Response
    {
        $product = Product::findOrFail($id);
        $brands = Brand::orderBy('name')->get();

        return Inertia::render('admin/products/[id]/edit', [
            'product' => $product,
            'brands' => $brands,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_description' => 'nullable|string',
            'full_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'discount' => 'nullable|integer|min:0|max:100',
            'sku' => "nullable|string|unique:products,sku,{$id}",
            'brand_id' => 'nullable|exists:brands,id',
            'model' => 'nullable|string',
            'image_url' => 'nullable|url',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);

        return redirect()->route('admin.products.index');
    }

    public function destroy(int $id): RedirectResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return redirect()->route('admin.products.index');
    }

    public function restore(int $id): RedirectResponse
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->restore();

        return redirect()->route('admin.products.index');
    }

    public function forceDelete(int $id): RedirectResponse
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->forceDelete();

        return redirect()->route('admin.products.index');
    }
}
