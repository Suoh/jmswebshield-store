<?php

namespace App\Http\Controllers\Admin;

use App\Actions\DeleteProductImage;
use App\Actions\ReorderProductImages;
use App\Actions\SetCoverImage;
use App\Enums\ProductImageAction;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\File;

class ProductImageController extends Controller
{
    public function __construct(
        private SetCoverImage $setCoverImage,
        private DeleteProductImage $deleteProductImage,
        private ReorderProductImages $reorderProductImages,
    ) {}

    public function sessionStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => [
                'required',
                File::types(['jpg', 'jpeg', 'png', 'webp'])->max(2 * 1024),
            ],
            'session_id' => ['required', 'string', 'size:36'],
        ]);

        $sessionId = $validated['session_id'];
        $file = $validated['image'];
        $filename = Str::uuid().'.'.$file->extension();
        $path = $file->storeAs("product-images/pending/{$sessionId}", $filename, 'public');

        $image = ProductImage::create([
            'product_id' => null,
            'session_id' => $sessionId,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'size_bytes' => $file->getSize(),
            'position' => 0,
            'is_cover' => false,
        ]);

        return response()->json([
            'id' => $image->id,
            'url' => $image->url,
        ], 201);
    }

    public function destroySession(ProductImage $productImage): JsonResponse
    {
        if ($productImage->product_id !== null) {
            return response()->json(['message' => 'Image is linked to a product'], 422);
        }

        $productImage->delete();

        return response()->json(null, 204);
    }

    public function link(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'product_image_ids' => ['required', 'array'],
            'product_image_ids.*' => ['integer', 'exists:product_images,id'],
        ]);

        $count = ProductImage::whereIn('id', $validated['product_image_ids'])
            ->whereNull('product_id')
            ->update(['product_id' => $product->id]);

        return response()->json(['linked' => $count]);
    }

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

        return redirect()->back()->with('success', ProductImageAction::Uploaded->value);
    }

    public function batchStore(Request $request, int $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $currentCount = $product->images()->count();
        $files = $request->file('images');

        if (! $files || ! is_array($files)) {
            return response()->json(['message' => 'No se proporcionaron imágenes'], 422);
        }

        $maxAdd = 6 - $currentCount;
        if (count($files) > $maxAdd) {
            return response()->json(['errors' => ['image' => ["Máximo {$maxAdd} imágenes más"]]], 422);
        }

        $created = [];
        foreach ($files as $file) {
            if (! in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/webp'])) {
                continue;
            }
            if ($file->getSize() > 2 * 1024 * 1024) {
                continue;
            }

            $path = $file->store("products/{$product->id}", 'public');
            $isCover = $product->images()->count() === 0;

            $image = ProductImage::create([
                'product_id' => $product->id,
                'path' => $path,
                'position' => $product->images()->max('position') + 1,
                'is_cover' => $isCover,
            ]);

            $created[] = [
                'id' => $image->id,
                'product_id' => $image->product_id,
                'path' => $image->path,
                'position' => $image->position,
                'is_cover' => $image->is_cover,
                'url' => $image->url,
                'created_at' => $image->created_at?->toISOString() ?? '',
                'updated_at' => $image->updated_at?->toISOString() ?? '',
            ];
        }

        return response()->json(['images' => $created], 201);
    }

    public function reorder(Request $request, int $productId): RedirectResponse
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        try {
            ($this->reorderProductImages)($product, $validated['ids']);
        } catch (\InvalidArgumentException $e) {
            return back()->withInput()->withErrors(['ids' => $e->getMessage()]);
        }

        return redirect()->back()->with('success', ProductImageAction::Reordered->value);
    }

    public function setCover(int $productId, int $imageId): RedirectResponse
    {
        $product = Product::findOrFail($productId);

        ($this->setCoverImage)($product, $imageId);

        return redirect()->back()->with('success', ProductImageAction::CoverSet->value);
    }

    public function destroy(int $productId, int $imageId): RedirectResponse
    {
        $product = Product::findOrFail($productId);

        ($this->deleteProductImage)($product, $imageId);

        return redirect()->back()->with('success', ProductImageAction::Deleted->value);
    }
}
