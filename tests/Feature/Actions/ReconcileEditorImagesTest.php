<?php

namespace Tests\Feature\Actions;

use App\Actions\ReconcileEditorImages;
use App\Models\EditorImage;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    actingAsAdmin();
});

describe('ReconcileEditorImages', function () {
    it('deletes editor images whose paths are not in the final HTML', function () {
        Storage::fake('public');

        $product = Product::factory()->create();
        $kept = EditorImage::factory()->forProduct($product->id)->create([
            'path' => 'editor-images/kept.jpg',
        ]);
        $removed = EditorImage::factory()->forProduct($product->id)->create([
            'path' => 'editor-images/removed.jpg',
        ]);

        $html = '<p>Text</p><img src="'.asset('storage/editor-images/kept.jpg').'" alt="Kept">';

        app(ReconcileEditorImages::class)($product, $html);

        $this->assertDatabaseHas('editor_images', ['id' => $kept->id]);
        $this->assertDatabaseMissing('editor_images', ['id' => $removed->id]);
    });

    it('keeps all images when all are referenced', function () {
        $product = Product::factory()->create();
        $img1 = EditorImage::factory()->forProduct($product->id)->create(['path' => 'editor-images/a.jpg']);
        $img2 = EditorImage::factory()->forProduct($product->id)->create(['path' => 'editor-images/b.jpg']);

        $html = '<img src="'.asset('storage/editor-images/a.jpg').'">'
            .'<img src="'.asset('storage/editor-images/b.jpg').'">';

        app(ReconcileEditorImages::class)($product, $html);

        $this->assertDatabaseHas('editor_images', ['id' => $img1->id]);
        $this->assertDatabaseHas('editor_images', ['id' => $img2->id]);
    });

    it('does nothing when product has no editor images', function () {
        $product = Product::factory()->create();

        app(ReconcileEditorImages::class)($product, '<p>No images</p>');

        expect(EditorImage::count())->toBe(0);
    });

    it('handles empty HTML gracefully', function () {
        $product = Product::factory()->create();
        $image = EditorImage::factory()->forProduct($product->id)->create();

        app(ReconcileEditorImages::class)($product, '');

        $this->assertDatabaseMissing('editor_images', ['id' => $image->id]);
    });

    it('deletes files when reconciling removes images', function () {
        Storage::fake('public');
        Storage::disk('public')->put('editor-images/to-delete.jpg', 'content');
        Storage::disk('public')->put('editor-images/to-keep.jpg', 'content');

        $product = Product::factory()->create();
        EditorImage::factory()->forProduct($product->id)->create([
            'path' => 'editor-images/to-keep.jpg',
        ]);
        EditorImage::factory()->forProduct($product->id)->create([
            'path' => 'editor-images/to-delete.jpg',
        ]);

        $html = '<img src="'.asset('storage/editor-images/to-keep.jpg').'">';

        app(ReconcileEditorImages::class)($product, $html);

        Storage::disk('public')->assertExists('editor-images/to-keep.jpg');
        Storage::disk('public')->assertMissing('editor-images/to-delete.jpg');
    });
});
