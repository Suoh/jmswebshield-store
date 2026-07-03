<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    private const CATEGORIES = [
        'Cámaras',
        'Redes',
        'Audio',
        'Energía',
        'Cables',
        'Accesorios',
        'Video',
        'Almacenamiento',
    ];

    public function run(): void
    {
        foreach (self::CATEGORIES as $name) {
            Category::firstOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)],
            );
        }
    }
}
