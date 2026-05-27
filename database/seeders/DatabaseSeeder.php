<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MarcaSeeder::class,
            AdminUserSeeder::class,
            ProductSeeder::class,
        ]);
    }
}
