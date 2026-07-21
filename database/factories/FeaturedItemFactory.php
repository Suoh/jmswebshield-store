<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\FeaturedItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeaturedItem>
 */
class FeaturedItemFactory extends Factory
{
    protected $model = FeaturedItem::class;

    public function definition(): array
    {
        return [
            'featurable_id' => Category::factory(),
            'featurable_type' => Category::class,
            'position' => fake()->numberBetween(0, 100),
        ];
    }
}
