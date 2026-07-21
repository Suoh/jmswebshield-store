<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/create');
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $data = [
            'name' => $request->validated('name'),
            'slug' => Str::slug($request->validated('name')),
        ];

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        Category::create($data);

        return redirect()->route('admin.categories.index')->with('success', 'Categoría creada exitosamente.');
    }

    public function edit(int $id): Response
    {
        $category = Category::withCount('products')->findOrFail($id);

        return Inertia::render('admin/categories/[id]/edit', [
            'category' => $category,
        ]);
    }

    public function update(CategoryRequest $request, int $id): RedirectResponse
    {
        $category = Category::findOrFail($id);

        $data = [
            'name' => $request->validated('name'),
            'slug' => Str::slug($request->validated('name')),
        ];

        if ($request->hasFile('image')) {
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }

            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);

        return redirect()->route('admin.categories.index')->with('success', 'Categoría actualizada exitosamente.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $category = Category::findOrFail($id);

        if ($category->products()->exists()) {
            return abort(409, 'No se puede eliminar una categoría que tiene productos asociados.');
        }

        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }

        $category->delete();

        return redirect()->route('admin.categories.index')->with('success', 'Categoría eliminada.');
    }
}
