<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\FeaturedItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeaturedCategoryController extends Controller
{
    public function index(): Response
    {
        $items = FeaturedItem::where('featurable_type', Category::class)
            ->with(['featurable' => fn ($q) => $q->withCount('products')])
            ->orderBy('position')
            ->get();

        $categories = Category::whereDoesntHave('featuredPosition')
            ->withCount('products')
            ->orderBy('name')
            ->get(['id', 'name', 'image_path']);

        return Inertia::render('admin/featured/categories/index', [
            'items' => $items,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
        ]);

        $exists = FeaturedItem::where('featurable_type', Category::class)
            ->where('featurable_id', $data['category_id'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'La categoría ya está destacada.');
        }

        $maxPosition = FeaturedItem::where('featurable_type', Category::class)
            ->max('position');

        $item = FeaturedItem::create([
            'featurable_id' => $data['category_id'],
            'featurable_type' => Category::class,
            'position' => ($maxPosition ?? -1) + 1,
        ]);

        $item->load('featurable');

        if ($request->wantsJson()) {
            return response()->json($item);
        }

        return redirect()->route('admin.featured.categories.index')
            ->with('success', 'Categoría agregada a destacadas.');
    }

    public function destroy(FeaturedItem $featuredItem): RedirectResponse
    {
        if ($featuredItem->featurable_type !== Category::class) {
            abort(404);
        }

        $featuredItem->delete();

        return redirect()->route('admin.featured.categories.index')
            ->with('success', 'Categoría removida de destacadas.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:featured_items,id'],
        ]);

        foreach ($data['ids'] as $index => $id) {
            FeaturedItem::where('id', $id)
                ->where('featurable_type', Category::class)
                ->update(['position' => $index]);
        }

        return redirect()->route('admin.featured.categories.index')
            ->with('success', 'Orden actualizado.');
    }
}
