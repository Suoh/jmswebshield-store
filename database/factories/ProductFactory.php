<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'short_description' => fake()->sentence(),
            'full_description' => fake()->paragraphs(3, true),
            'stock' => fake()->numberBetween(0, 100),
            'price' => fake()->randomFloat(2, 10, 5000),
            'discount' => fake()->boolean(30) ? fake()->numberBetween(5, 50) : 0,
            'image_url' => 'https://picsum.photos/400/300?random='.fake()->unique()->numberBetween(1, 1000),
            'brand_id' => Brand::factory(),
            'model' => fake()->bothify('Model-####'),
            'metadata' => [
                fake()->word() => fake()->word(),
                fake()->word() => fake()->word(),
                fake()->word() => fake()->word(),
            ],
            'is_active' => fake()->boolean(90),
        ];
    }
}
