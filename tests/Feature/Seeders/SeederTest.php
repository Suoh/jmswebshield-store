<?php

use App\Models\Brand;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\BrandSeeder;
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
    putenv('ADMIN_EMAILS=admin@test.com');

    $this->seed(AdminUserSeeder::class);

    expect(User::where('email', 'admin@test.com')->exists())->toBeTrue();

    putenv('ADMIN_EMAILS');
});

it('database seeder calls all seeders in correct order', function () {
    putenv('ADMIN_EMAILS=admin@test.com');

    $this->seed();

    expect(Brand::count())->toBe(8)
        ->and(Product::count())->toBe(24)
        ->and(User::count())->toBeGreaterThanOrEqual(1);

    putenv('ADMIN_EMAILS');
});
