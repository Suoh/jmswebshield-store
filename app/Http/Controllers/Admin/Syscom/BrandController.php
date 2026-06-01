<?php

namespace App\Http\Controllers\Admin\Syscom;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class BrandController extends Controller
{
    public function index(): View
    {
        return view('admin.syscom.brands.index');
    }

    public function import(Request $request): JsonResponse
    {
        abort(501);
    }
}
