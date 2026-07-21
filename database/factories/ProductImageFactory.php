<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductImage>
 */
class ProductImageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'path' => 'products/'.fake()->unique()->numberBetween(1, 1000).'.jpg',
            'position' => fake()->numberBetween(0, 5),
            'is_cover' => false,
        ];
    }

    public function cover(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_cover' => true,
        ]);
    }
}
