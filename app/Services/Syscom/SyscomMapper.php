<?php

namespace App\Services\Syscom;

use App\Services\HtmlSanitizer;
use Illuminate\Support\Str;

class SyscomMapper
{
    public const BRAND_ID = 'id';

    public const BRAND_NAME = 'nombre';

    public const PRODUCT_ID = 'id';

    public const PRODUCT_NAME = 'nombre';

    public const PRODUCT_SHORT_DESC = 'descripcion_corta';

    public const PRODUCT_FULL_DESC = 'descripcion_larga';

    public const PRODUCT_STOCK = 'stock';

    public const PRODUCT_MODEL = 'modelo';

    public const PRODUCT_BRAND_ID = 'marca_id';

    public const PRODUCT_CATEGORY_ID = 'categoria_id';

    public const PRODUCT_IMAGE = 'imagen';

    public const PRICE_LISTA = 'precio_lista';

    public const PRICE_DESCUENTO = 'precio_descuento';

    public static function toLocalBrand(array $syscomBrand): array
    {
        $name = $syscomBrand[self::BRAND_NAME] ?? '';
        $slug = Str::slug($name);

        return [
            'name' => $name,
            'slug' => $slug,
            'metadata' => [
                'syscom_id' => $syscomBrand[self::BRAND_ID] ?? '',
            ],
        ];
    }

    public static function toLocalProduct(array $syscomProduct, float $adminPrice): array
    {
        $prices = $syscomProduct['precios'] ?? [];

        return [
            'name' => $syscomProduct[self::PRODUCT_NAME] ?? '',
            'short_description' => HtmlSanitizer::sanitize($syscomProduct[self::PRODUCT_SHORT_DESC] ?? null),
            'full_description' => HtmlSanitizer::sanitize($syscomProduct[self::PRODUCT_FULL_DESC] ?? null),
            'stock' => (int) ($syscomProduct[self::PRODUCT_STOCK] ?? 0),
            'price' => (float) $adminPrice,
            'model' => $syscomProduct[self::PRODUCT_MODEL] ?? null,
            'image_url' => $syscomProduct[self::PRODUCT_IMAGE] ?? null,
            'brand_id' => null,
            'is_active' => true,
            'metadata' => [
                'syscom_id' => $syscomProduct[self::PRODUCT_ID] ?? '',
                'syscom_marca_id' => $syscomProduct[self::PRODUCT_BRAND_ID] ?? null,
                'syscom_precios' => [
                    'precio_lista' => $prices[self::PRICE_LISTA] ?? null,
                    'precio_descuento' => $prices[self::PRICE_DESCUENTO] ?? null,
                ],
            ],
        ];
    }
}
