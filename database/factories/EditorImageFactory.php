<?php

namespace Database\Factories;

use App\Models\EditorImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EditorImage>
 */
class EditorImageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => null,
            'session_id' => fake()->uuid(),
            'path' => 'editor-images/pending/'.fake()->uuid().'.jpg',
            'original_name' => fake()->word().'.jpg',
            'size_bytes' => fake()->numberBetween(1000, 1048576),
        ];
    }

    public function forProduct(int $productId): static
    {
        return $this->state(fn (array $attributes) => [
            'product_id' => $productId,
            'path' => 'editor-images/'.$productId.'/'.fake()->uuid().'.jpg',
        ]);
    }
}
