<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SortOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $query = Product::with('brand')
            ->when(request('search'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when(request('brand_id'), fn ($q, $brandId) => $q->where('brand_id', $brandId))
            ->when(request('is_active') !== null, fn ($q) => $q->where('is_active', request('is_active') == '1'));

        if (request('trashed') === '1') {
            $query->onlyTrashed();
        }

        $products = $query->orderBy('created_at', SortOrder::Desc->value)->paginate(15);
        $brands = Brand::orderBy('name')->get();

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'brands' => $brands,
            'filters' => [
                'search' => request('search'),
                'brand_id' => request('brand_id'),
                'is_active' => request('is_active'),
                'trashed' => request('trashed'),
            ],
        ]);
    }

    public function create(): Response
    {
        $brands = Brand::orderBy('name')->get();
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('admin/products/create', [
            'brands' => $brands,
            'categories' => $categories,
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $product = Product::create($request->validated());

        if ($request->has('category_ids')) {
            $product->categories()->sync($request->input('category_ids', []));
        }

        return redirect()->route('admin.products.index')->with('success', 'Producto creado exitosamente.');
    }

    public function edit(int $id): Response
    {
        $product = Product::with(['brand', 'images' => fn ($q) => $q->orderBy('position'), 'categories'])->findOrFail($id);
        $brands = Brand::orderBy('name')->get();
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('admin/products/[id]/edit', [
            'product' => $product,
            'brands' => $brands,
            'categories' => $categories,
        ]);
    }

    public function update(ProductRequest $request, int $id): RedirectResponse
    {
        $product = Product::findOrFail($id);

        $product->update($request->validated());

        if ($request->has('category_ids')) {
            $product->categories()->sync($request->input('category_ids', []));
        }

        return redirect()->route('admin.products.index')->with('success', 'Producto actualizado exitosamente.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Producto eliminado.');
    }

    public function restore(int $id): RedirectResponse
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->restore();

        return redirect()->route('admin.products.index')->with('success', 'Producto restaurado.');
    }

    public function forceDelete(int $id): RedirectResponse
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->forceDelete();

        return redirect()->route('admin.products.index')->with('success', 'Producto eliminado permanentemente.');
    }
}
