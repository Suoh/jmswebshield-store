<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EditorImage;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\File;

class EditorImageController extends Controller
{
    public function store(Request $request): JsonResponse
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
        $path = $file->storeAs("editor-images/pending/{$sessionId}", $filename, 'public');

        $image = EditorImage::create([
            'product_id' => null,
            'session_id' => $sessionId,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'size_bytes' => $file->getSize(),
        ]);

        return response()->json([
            'id' => $image->id,
            'url' => $image->url,
        ], 201);
    }

    public function link(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'editor_image_ids' => ['required', 'array'],
            'editor_image_ids.*' => ['integer', 'exists:editor_images,id'],
        ]);

        $count = EditorImage::whereIn('id', $validated['editor_image_ids'])
            ->whereNull('product_id')
            ->update(['product_id' => $product->id]);

        return response()->json(['linked' => $count]);
    }

    public function destroy(EditorImage $editorImage): JsonResponse
    {
        $editorImage->delete();

        return response()->json(null, 204);
    }
}
