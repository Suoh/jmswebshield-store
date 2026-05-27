<?php

use App\Models\Marca;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\MarcaSeeder;
use Database\Seeders\ProductSeeder;

it('marca seeder creates 8 marcas', function () {
    $this->seed(MarcaSeeder::class);

    expect(Marca::count())->toBe(8);
});

it('product seeder creates 24 products', function () {
    $this->seed(MarcaSeeder::class);
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

    expect(Marca::count())->toBe(8)
        ->and(Product::count())->toBe(24)
        ->and(User::count())->toBeGreaterThanOrEqual(1);

    putenv('ADMIN_EMAILS');
});
