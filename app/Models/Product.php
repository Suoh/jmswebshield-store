<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'short_description',
    'full_description',
    'stock',
    'price',
    'discount',
    'image_url',
    'marca_id',
    'model',
    'extra_data',
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
            'extra_data' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function marca(): BelongsTo
    {
        return $this->belongsTo(Marca::class);
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
            get: fn () => $this->image_url,
        );
    }
}
