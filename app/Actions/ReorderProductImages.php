<?php

namespace App\Actions;

use App\Models\Product;
use App\Models\ProductImage;
use InvalidArgumentException;

class ReorderProductImages
{
    public function __invoke(Product $product, array $ids): void
    {
        $productImageIds = $product->images()->pluck('id')->toArray();

        if (count($ids) !== count($productImageIds) || array_diff($ids, $productImageIds) !== array_diff($productImageIds, $ids)) {
            throw new InvalidArgumentException('Los IDs proporcionados no coinciden con las imágenes del producto.');
        }

        foreach ($ids as $position => $imageId) {
            ProductImage::where('id', $imageId)->update(['position' => $position]);
        }
    }
}
