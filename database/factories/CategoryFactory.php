<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Cámaras',
            'Redes',
            'Audio',
            'Energía',
            'Cables',
            'Accesorios',
            'Video',
            'Almacenamiento',
        ]);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'metadata' => null,
        ];
    }
}
