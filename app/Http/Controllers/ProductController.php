<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::where('is_active', true)
            ->with(['brand', 'images' => fn ($q) => $q->orderBy('position')]);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search): void {
                $like = '%' . strtolower($search) . '%';
                $q->whereRaw('LOWER(name) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(short_description) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(model) LIKE ?', [$like]);
            });
        }

        if ($request->has('brand')) {
            $brands = (array) $request->input('brand');
            $query->whereIn('brand_id', array_filter($brands, fn ($v) => is_numeric($v)));
        }

        if ($request->filled('price_min')) {
            $query->where('price', '>=', (float) $request->input('price_min'));
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', (float) $request->input('price_max'));
        }

        if ($request->input('stock') === 'in_stock') {
            $query->where('stock', '>', 0);
        }

        $allowedSorts = ['created_at', 'price', 'name'];
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        $sort = in_array($sort, $allowedSorts) ? $sort : 'created_at';
        $order = in_array($order, ['asc', 'desc']) ? $order : 'desc';
        $query->orderBy($sort, $order);

        $products = $query->paginate(12)->withQueryString();

        $brands = Brand::orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('products/index', [
            'products' => $products,
            'brands' => $brands,
        ]);
    }

    public function show(Product $product): Response
    {
        $product->load(['brand', 'images' => fn ($q) => $q->orderBy('position')]);

        return Inertia::render('products/[id]/show', [
            'product' => $product,
        ]);
    }
}
