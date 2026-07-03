<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\BrandSeeder;
use Database\Seeders\CategorySeeder;
use Database\Seeders\ProductSeeder;

it('brand seeder creates 8 brands', function () {
    $this->seed(BrandSeeder::class);

    expect(Brand::count())->toBe(8);
});

it('product seeder creates 24 products', function () {
    $this->seed(BrandSeeder::class);
    $this->seed(ProductSeeder::class);

    expect(Product::count())->toBe(24);
});

it('admin user seeder creates admin user from env', function () {
    $_SERVER['ADMIN_EMAIL'] = 'admin@test.com';

    $this->seed(AdminUserSeeder::class);

    expect(User::where('email', 'admin@test.com')->exists())->toBeTrue();

    unset($_SERVER['ADMIN_EMAIL']);
});

it('category seeder creates 8 categories with realistic names', function () {
    $this->seed(CategorySeeder::class);

    expect(Category::count())->toBe(8);

    $names = Category::pluck('name')->toArray();
    expect($names)->toContain('Cámaras', 'Redes', 'Audio', 'Energía', 'Cables', 'Accesorios', 'Video', 'Almacenamiento');
});

it('category seeder is idempotent', function () {
    $this->seed(CategorySeeder::class);
    $this->seed(CategorySeeder::class);

    expect(Category::count())->toBe(8);
});

it('product seeder assigns 1-2 categories per product', function () {
    $this->seed(CategorySeeder::class);
    $this->seed(BrandSeeder::class);
    $this->seed(ProductSeeder::class);

    $products = Product::with('categories')->get();
    expect($products->count())->toBe(24);

    foreach ($products as $product) {
        expect($product->categories->count())
            ->toBeGreaterThanOrEqual(1)
            ->toBeLessThanOrEqual(2);
    }
});

it('database seeder calls all seeders in correct order', function () {
    $_SERVER['ADMIN_EMAIL'] = 'admin@test.com';

    $this->seed();

    expect(Brand::count())->toBe(8)
        ->and(Category::count())->toBe(8)
        ->and(Product::count())->toBe(24)
        ->and(User::count())->toBeGreaterThanOrEqual(1);

    $productsWithCategories = Product::has('categories')->count();
    expect($productsWithCategories)->toBeGreaterThan(0);

    unset($_SERVER['ADMIN_EMAIL']);
});
