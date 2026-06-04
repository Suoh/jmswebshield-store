<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'short_description',
    'full_description',
    'stock',
    'price',
    'discount',
    'image_url',
    'brand_id',
    'model',
    'sku',
    'metadata',
    'is_active',
])]
class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'discount' => 'integer',
            'stock' => 'integer',
            'metadata' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    protected function availability(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->stock > 0 ? 'Disponible' : 'Agotado',
        );
    }

    protected function discountedPrice(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->discount > 0
                ? number_format($this->price * (1 - $this->discount / 100), 2, '.', '')
                : null,
        );
    }

    protected function coverImage(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                $coverImage = $this->images()->where('is_cover', true)->first();
                if ($coverImage) {
                    return asset("storage/{$coverImage->path}");
                }

                return $this->image_url;
            },
        );
    }
}
