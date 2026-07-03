<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $brands = Brand::all();
        $categories = Category::all();

        Product::factory()
            ->count(24)
            ->recycle($brands)
            ->afterCreating(function (Product $product) use ($categories): void {
                if ($categories->isNotEmpty()) {
                    $product->categories()->attach(
                        $categories->random(rand(1, min(2, $categories->count()))),
                    );
                }
            })
            ->create();
    }
}
