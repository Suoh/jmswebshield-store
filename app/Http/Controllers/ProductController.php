<?php

namespace App\Http\Controllers;

use App\Enums\SortOrder;
use App\Enums\StockFilter;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::where('is_active', true)
            ->with(['brand', 'categories', 'images' => fn ($q) => $q->where('is_cover', true)]);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search): void {
                $term = "%{$search}%";
                $q->whereLike('name', $term, caseSensitive: false)
                    ->orWhereLike('short_description', $term, caseSensitive: false)
                    ->orWhereLike('model', $term, caseSensitive: false);
            });
        }

        if ($request->has('brand')) {
            $brands = (array) $request->input('brand');
            $query->whereIn('brand_id', array_filter($brands, fn ($v) => is_numeric($v)));
        }

        if ($request->has('category')) {
            $categoryIds = (array) $request->input('category');
            $query->whereHas('categories', fn ($q) => $q->whereIn('categories.id', array_filter($categoryIds, fn ($v) => is_numeric($v))));
        }

        if ($request->filled('price_min')) {
            $query->where('price', '>=', (float) $request->input('price_min'));
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', (float) $request->input('price_max'));
        }

        if ($request->input('stock') === StockFilter::InStock->value) {
            $query->where('stock', '>', 0);
        }

        $allowedSorts = ['created_at', 'price', 'name'];
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', SortOrder::Desc->value);
        $sort = in_array($sort, $allowedSorts) ? $sort : 'created_at';
        $allowedOrders = array_column(SortOrder::cases(), 'value');
        $order = in_array($order, $allowedOrders) ? $order : SortOrder::Desc->value;
        $query->orderBy($sort, $order);

        $products = $query->paginate(12)->withQueryString();

        $brands = Brand::orderBy('name')->get(['id', 'name', 'slug']);
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $banners = Banner::where('is_active', true)
            ->orderBy('position')
            ->get();

        return Inertia::render('products/index', [
            'products' => $products,
            'brands' => $brands,
            'categories' => $categories,
            'banners' => $banners,
        ]);
    }

    public function show(Product $product): Response
    {
        $product->load(['brand', 'categories', 'images' => fn ($q) => $q->orderBy('position')]);

        return Inertia::render('products/[id]/show', [
            'product' => $product,
        ]);
    }
}
