<?php

namespace Database\Seeders;

use App\Models\Marca;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $marcas = Marca::all();

        Product::factory()
            ->count(24)
            ->recycle($marcas)
            ->create();
    }
}
