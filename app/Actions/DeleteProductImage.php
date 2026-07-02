<?php

namespace App\Actions;

use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class DeleteProductImage
{
    public function __invoke(Product $product, int $imageId): void
    {
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
    }
}
