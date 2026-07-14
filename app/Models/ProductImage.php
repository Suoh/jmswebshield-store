<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable(['product_id', 'session_id', 'path', 'original_name', 'size_bytes', 'position', 'is_cover'])]
class ProductImage extends Model
{
    use HasFactory;

    protected $appends = ['url'];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_cover' => 'boolean',
            'size_bytes' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeOrphans(Builder $query, int $olderThanHours = 24): Builder
    {
        return $query
            ->whereNull('product_id')
            ->where('created_at', '<', now()->subHours($olderThanHours));
    }

    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn (): string => asset("storage/{$this->path}"),
        );
    }

    protected static function booted(): void
    {
        static::deleting(function (self $image): void {
            Storage::disk('public')->delete($image->path);
        });
    }
}
