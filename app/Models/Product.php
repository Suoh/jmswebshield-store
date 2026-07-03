<?php

namespace App\Models;

use App\Models\Concerns\HasMetadata;
use App\Services\HtmlSanitizer;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

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
    use HasFactory, HasMetadata, SoftDeletes;

    protected $appends = ['cover_image', 'availability', 'discounted_price'];

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

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function editorImages(): HasMany
    {
        return $this->hasMany(EditorImage::class);
    }

    protected static function booted(): void
    {
        static::forceDeleting(function (self $product): void {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->path);
            }

            foreach ($product->editorImages as $image) {
                Storage::disk('public')->delete($image->path);
            }
        });
    }

    public function scopeWhereHasSyscomId(Builder $query): void
    {
        $this->scopeWhereHasMetadataKey($query, 'syscom_id');
    }

    public static function importedSyscomIds(): Collection
    {
        return static::whereHasSyscomId()
            ->get()
            ->pluck('metadata.syscom_id')
            ->values();
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

    protected function fullDescription(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value) => HtmlSanitizer::sanitize($value),
        );
    }

    protected function coverImage(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                $cover = $this->relationLoaded('images')
                    ? $this->images->firstWhere('is_cover', true)
                    : $this->images()->where('is_cover', true)->first();

                if ($cover) {
                    return asset("storage/{$cover->path}");
                }

                return $this->image_url;
            },
        );
    }
}
