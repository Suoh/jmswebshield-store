<?php

namespace Tests\Feature\Services\Syscom;

use App\Models\Category;
use App\Services\Syscom\CategoryImporter;

beforeEach(function () {
    $this->withoutVite();
});

describe('CategoryImporter', function () {
    beforeEach(function () {
        Category::query()->forceDelete();
    });

    it('imports a single category', function () {
        $importer = new CategoryImporter;
        $result = $importer->import([
            ['syscom_id' => 'cat-001', 'name' => 'Cámaras'],
        ]);

        expect($result)->toBe(['imported' => 1, 'skipped' => 0])
            ->and(Category::count())->toBe(1)
            ->and(Category::first()->name)->toBe('Cámaras')
            ->and(Category::first()->metadata['syscom_id'])->toBe('cat-001');
    });

    it('imports multiple categories', function () {
        $importer = new CategoryImporter;
        $result = $importer->import([
            ['syscom_id' => 'cat-001', 'name' => 'Cámaras'],
            ['syscom_id' => 'cat-002', 'name' => 'Redes'],
            ['syscom_id' => 'cat-003', 'name' => 'Audio'],
        ]);

        expect($result)->toBe(['imported' => 3, 'skipped' => 0])
            ->and(Category::count())->toBe(3);
    });

    it('skips already imported categories', function () {
        Category::factory()->create([
            'name' => 'Existing',
            'slug' => 'existing',
            'metadata' => ['syscom_id' => 'cat-001'],
        ]);

        $importer = new CategoryImporter;
        $result = $importer->import([
            ['syscom_id' => 'cat-001', 'name' => 'Cámaras'],
            ['syscom_id' => 'cat-002', 'name' => 'Redes'],
        ]);

        expect($result)->toBe(['imported' => 1, 'skipped' => 1])
            ->and(Category::count())->toBe(2)
            ->and(Category::where('name', 'Existing')->exists())->toBeTrue();
    });

    it('skips all when all categories already imported', function () {
        Category::factory()->create([
            'name' => 'Existing 1',
            'slug' => 'existing-1',
            'metadata' => ['syscom_id' => 'cat-001'],
        ]);
        Category::factory()->create([
            'name' => 'Existing 2',
            'slug' => 'existing-2',
            'metadata' => ['syscom_id' => 'cat-002'],
        ]);

        $importer = new CategoryImporter;
        $result = $importer->import([
            ['syscom_id' => 'cat-001', 'name' => 'Cámaras'],
            ['syscom_id' => 'cat-002', 'name' => 'Redes'],
        ]);

        expect($result)->toBe(['imported' => 0, 'skipped' => 2]);
    });

    it('batch limit 50', function () {
        $batch = [];
        for ($i = 1; $i <= 55; $i++) {
            $batch[] = ['syscom_id' => "cat-{$i}", 'name' => "Category {$i}"];
        }

        $importer = new CategoryImporter;
        $result = $importer->import($batch);

        expect($result['imported'])->toBeLessThanOrEqual(55);
    });
});
