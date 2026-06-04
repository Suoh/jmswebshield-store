<?php

use App\Http\Controllers\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ProductImageController;
use App\Http\Controllers\Admin\Syscom\BrandController as SyscomBrandController;
use App\Http\Controllers\Admin\Syscom\ProductController as SyscomProductController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/products')->name('home');

Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('brands', AdminBrandController::class);

    Route::resource('products', AdminProductController::class)->except(['create', 'show']);
    Route::get('products/create', [AdminProductController::class, 'create'])->name('products.create');
    Route::get('products/{product}/edit', [AdminProductController::class, 'edit'])->name('products.edit');

    Route::post('products/{id}/restore', [AdminProductController::class, 'restore'])->name('products.restore');
    Route::delete('products/{id}/force', [AdminProductController::class, 'forceDelete'])->name('products.forceDelete');

    Route::post('products/{product}/images/batch', [ProductImageController::class, 'batchStore'])->name('products.images.batchStore');
    Route::post('products/{product}/images', [ProductImageController::class, 'store'])->name('products.images.store');
    Route::put('products/{product}/images/reorder', [ProductImageController::class, 'reorder'])->name('products.images.reorder');
    Route::put('products/{product}/images/{image}/cover', [ProductImageController::class, 'setCover'])->name('products.images.setCover');
    Route::delete('products/{product}/images/{image}', [ProductImageController::class, 'destroy'])->name('products.images.destroy');

    Route::get('syscom/brands', [SyscomBrandController::class, 'index'])->name('syscom.brands.index');
    Route::post('syscom/brands/import', [SyscomBrandController::class, 'import'])->name('syscom.brands.import');

    Route::get('syscom/products', [SyscomProductController::class, 'index'])->name('syscom.products.index');
    Route::post('syscom/products/import', [SyscomProductController::class, 'import'])->name('syscom.products.import');
});

require __DIR__.'/settings.php';
