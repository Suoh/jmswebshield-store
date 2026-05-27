<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $brands = Brand::all();

        Product::factory()
            ->count(24)
            ->recycle($brands)
            ->create();
    }
}
