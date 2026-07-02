<?php

namespace App\Actions;

use App\Models\Product;

class SetCoverImage
{
    public function __invoke(Product $product, int $imageId): void
    {
        $image = $product->images()->findOrFail($imageId);

        $product->images()->update(['is_cover' => false]);
        $image->update(['is_cover' => true]);
    }
}
