<?php

namespace App\Http\Controllers\Admin\Syscom;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/syscom/brands/index');
    }

    public function import(Request $request): JsonResponse
    {
        abort(501);
    }
}
