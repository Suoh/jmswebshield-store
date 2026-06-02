<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/brands/index');
    }

    public function create(): Response
    {
        return Inertia::render('admin/brands/create');
    }

    public function store(Request $request): RedirectResponse
    {
        abort(501);
    }

    public function edit(int $id): Response
    {
        return Inertia::render('admin/brands/[id]/edit', ['id' => $id]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        abort(501);
    }

    public function destroy(int $id): RedirectResponse
    {
        abort(501);
    }
}
