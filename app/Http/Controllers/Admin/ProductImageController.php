<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

class ProductImageController extends Controller
{
    public function store(Request $request, int $productId): RedirectResponse
    {
        $product = Product::findOrFail($productId);

        if ($product->images()->count() >= 6) {
            return back()->withInput()->withErrors(['image' => 'Máximo 6 imágenes por producto.']);
        }

        $validated = $request->validate([
            'image' => [
                'required',
                File::types(['jpg', 'jpeg', 'png', 'webp'])->max(2 * 1024),
            ],
        ]);

        $file = $validated['image'];
        $path = $file->store("products/{$product->id}", 'public');

        $isCover = $product->images()->count() === 0;

        ProductImage::create([
            'product_id' => $product->id,
            'path' => $path,
            'position' => $product->images()->max('position') + 1,
            'is_cover' => $isCover,
        ]);

        return redirect()->back();
    }

    public function reorder(Request $request, int $productId): RedirectResponse
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        $ids = $validated['ids'];
        $productImageIds = $product->images()->pluck('id')->toArray();

        if (count($ids) !== count($productImageIds) || array_diff($ids, $productImageIds) !== array_diff($productImageIds, $ids)) {
            return back()->withInput()->withErrors(['ids' => 'Los IDs proporcionados no coinciden con las imágenes del producto.']);
        }

        foreach ($ids as $position => $imageId) {
            ProductImage::where('id', $imageId)->update(['position' => $position]);
        }

        return redirect()->back();
    }

    public function setCover(int $productId, int $imageId): RedirectResponse
    {
        $product = Product::findOrFail($productId);
        $image = $product->images()->findOrFail($imageId);

        $product->images()->update(['is_cover' => false]);
        $image->update(['is_cover' => true]);

        return redirect()->back();
    }

    public function destroy(int $productId, int $imageId): RedirectResponse
    {
        $product = Product::findOrFail($productId);
        $image = $product->images()->findOrFail($imageId);

        $wasCover = $image->is_cover;
        $imagePath = $image->path;

        $image->delete();

        if ($wasCover) {
            $nextImage = $product->images()->orderBy('position')->first();
            if ($nextImage) {
                $nextImage->update(['is_cover' => true]);
            }
        }

        Storage::disk('public')->delete($imagePath);

        return redirect()->back();
    }
}
