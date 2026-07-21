<?php

use App\Models\User;
use Database\Seeders\AdminUserSeeder;

it('admin user seeder creates admin user from env', function () {
    $_SERVER['ADMIN_EMAIL'] = 'admin@test.com';

    $this->seed(AdminUserSeeder::class);

    expect(User::where('email', 'admin@test.com')->exists())->toBeTrue();

    unset($_SERVER['ADMIN_EMAIL']);
});

it('database seeder creates the admin user only', function () {
    $_SERVER['ADMIN_EMAIL'] = 'admin@test.com';

    $this->seed();

    expect(User::count())->toBe(1)
        ->and(User::first()->email)->toBe('admin@test.com');

    unset($_SERVER['ADMIN_EMAIL']);
});
