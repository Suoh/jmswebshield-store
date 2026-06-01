<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class BrandController extends Controller
{
    public function index(): View
    {
        return view('admin.brands.index');
    }

    public function create(): View
    {
        return view('admin.brands.create');
    }

    public function store(Request $request): RedirectResponse
    {
        abort(501);
    }

    public function edit(int $id): View
    {
        return view('admin.brands.edit', ['id' => $id]);
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
