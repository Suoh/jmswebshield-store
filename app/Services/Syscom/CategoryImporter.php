<?php

namespace App\Services\Syscom;

use App\Models\Category;

class CategoryImporter
{
    public function import(array $categories): array
    {
        $imported = 0;
        $skipped = 0;

        $existingSyscomIds = Category::importedSyscomIds()->flip()->toArray();

        foreach ($categories as $category) {
            $syscomId = (string) ($category['syscom_id'] ?? '');
            $name = $category['name'];

            if (isset($existingSyscomIds[$syscomId])) {
                $skipped++;

                continue;
            }

            $localData = SyscomMapper::toLocalCategory([
                'id' => $syscomId,
                'nombre' => $name,
            ]);

            Category::create($localData);
            $existingSyscomIds[$syscomId] = true;
            $imported++;
        }

        return ['imported' => $imported, 'skipped' => $skipped];
    }
}
