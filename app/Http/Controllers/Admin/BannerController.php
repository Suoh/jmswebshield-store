<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Models\Banner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    public function index(): Response
    {
        $banners = Banner::orderBy('position')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('admin/banners/index', [
            'banners' => $banners,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/banners/create');
    }

    public function store(BannerRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('banners', 'public');
        }

        $data['position'] ??= 0;
        $data['is_active'] ??= true;

        Banner::create($data);

        return redirect()->route('admin.banners.index')->with('success', 'Banner creado exitosamente.');
    }

    public function edit(int $id): Response
    {
        $banner = Banner::findOrFail($id);

        return Inertia::render('admin/banners/[id]/edit', [
            'banner' => $banner,
        ]);
    }

    public function update(BannerRequest $request, int $id): RedirectResponse
    {
        $banner = Banner::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($banner->image_path);

            $data['image_path'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);

        return redirect()->route('admin.banners.index')->with('success', 'Banner actualizado exitosamente.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $banner = Banner::findOrFail($id);

        Storage::disk('public')->delete($banner->image_path);
        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner eliminado.');
    }
}
