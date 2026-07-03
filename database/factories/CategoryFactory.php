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
    private const REALISTIC_NAMES = [
        'Cámaras',
        'Redes',
        'Audio',
        'Energía',
        'Cables',
        'Accesorios',
        'Video',
        'Almacenamiento',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $suffix = fake()->numberBetween(1, 99999);

        return [
            'name' => "Categoría {$suffix}",
            'slug' => "categoria-{$suffix}",
            'metadata' => null,
        ];
    }

    public function realistic(): static
    {
        return $this->state(fn () => [
            'name' => fake()->unique()->randomElement(self::REALISTIC_NAMES),
            'slug' => fn (array $attrs) => Str::slug($attrs['name']),
        ]);
    }
}
