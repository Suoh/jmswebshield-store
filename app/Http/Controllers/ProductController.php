<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::where('is_active', true)
            ->with(['brand', 'images' => fn ($q) => $q->orderBy('position')])
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return Inertia::render('products/index', [
            'products' => $products,
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
