<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeaturedItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeaturedProductController extends Controller
{
    public function index(): Response
    {
        $items = FeaturedItem::where('featurable_type', Product::class)
            ->with('featurable.images', 'featurable.brand')
            ->orderBy('position')
            ->get();

        return Inertia::render('admin/featured/products/index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        $exists = FeaturedItem::where('featurable_type', Product::class)
            ->where('featurable_id', $data['product_id'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'El producto ya está destacado.');
        }

        $maxPosition = FeaturedItem::where('featurable_type', Product::class)
            ->max('position');

        $item = FeaturedItem::create([
            'featurable_id' => $data['product_id'],
            'featurable_type' => Product::class,
            'position' => ($maxPosition ?? -1) + 1,
        ]);

        $item->load('featurable.images', 'featurable.brand');

        if ($request->wantsJson()) {
            return response()->json($item);
        }

        return redirect()->route('admin.featured.products.index')
            ->with('success', 'Producto agregado a destacados.');
    }

    public function destroy(FeaturedItem $featuredItem): RedirectResponse
    {
        if ($featuredItem->featurable_type !== Product::class) {
            abort(404);
        }

        $featuredItem->delete();

        return redirect()->route('admin.featured.products.index')
            ->with('success', 'Producto removido de destacados.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:featured_items,id'],
        ]);

        foreach ($data['ids'] as $index => $id) {
            FeaturedItem::where('id', $id)
                ->where('featurable_type', Product::class)
                ->update(['position' => $index]);
        }

        return redirect()->route('admin.featured.products.index')
            ->with('success', 'Orden actualizado.');
    }
}
