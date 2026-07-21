<?php

namespace App\Actions;

use App\Models\EditorImage;
use App\Models\Product;

class ReconcileEditorImages
{
    public function __invoke(Product $product, string $finalHtml): void
    {
        $editorImages = EditorImage::where('product_id', $product->id)->get();

        if ($editorImages->isEmpty()) {
            return;
        }

        preg_match_all(
            '~<img[^>]+src="[^"]*/storage/(editor-images/[^"]+)"~i',
            $finalHtml,
            $matches,
        );

        $referencedPaths = $matches[1] ?? [];

        foreach ($editorImages as $image) {
            if (in_array($image->path, $referencedPaths, true)) {
                continue;
            }

            $image->delete();
        }
    }
}
