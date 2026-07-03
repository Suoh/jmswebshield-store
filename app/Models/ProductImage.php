<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['product_id', 'path', 'position', 'is_cover'])]
class ProductImage extends Model
{
    use HasFactory;

    protected $appends = ['url'];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_cover' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn (): string => asset("storage/{$this->path}"),
        );
    }
}
