<?php

namespace App\Services\Syscom;

use App\Models\Brand;

class BrandImporter
{
    public function import(array $brands): array
    {
        $imported = 0;
        $skipped = 0;

        $existingSyscomIds = Brand::importedSyscomIds()->flip()->toArray();

        foreach ($brands as $brand) {
            $syscomId = (string) ($brand['syscom_id'] ?? '');
            $name = $brand['name'];

            if (isset($existingSyscomIds[$syscomId])) {
                $skipped++;

                continue;
            }

            $localData = SyscomMapper::toLocalBrand([
                'id' => $syscomId,
                'nombre' => $name,
            ]);

            Brand::create($localData);
            $existingSyscomIds[$syscomId] = true;
            $imported++;
        }

        return ['imported' => $imported, 'skipped' => $skipped];
    }
}
