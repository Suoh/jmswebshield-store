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
            'full_description' => $this->generateRichHtml(),
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

    private function generateRichHtml(): string
    {
        $blocks = [];

        $blocks[] = '<h3>'.fake()->sentence(3).'</h3>';
        $blocks[] = '<p>'.fake()->paragraph().'</p>';

        if (fake()->boolean(50)) {
            $blocks[] = '<p><strong>'.fake()->sentence(4).'</strong> '.fake()->sentence(6).'</p>';
        }

        $listItems = [];
        for ($i = 0; $i < fake()->numberBetween(2, 4); $i++) {
            $listItems[] = '<li><p>'.fake()->sentence(3).'</p></li>';
        }
        $blocks[] = '<ul>'.implode('', $listItems).'</ul>';

        $blocks[] = '<p>'.fake()->paragraph().'</p>';

        if (fake()->boolean(30)) {
            $blocks[] = '<blockquote><p>'.fake()->sentence(5).'</p></blockquote>';
        }

        $blocks[] = '<p>'.fake()->sentence(8).' <code>'.fake()->word().'</code> '.fake()->sentence(4).'</p>';

        return implode('', $blocks);
    }
}
