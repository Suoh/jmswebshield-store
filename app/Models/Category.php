<?php

namespace App\Models;

use App\Models\Concerns\HasFeaturedPosition;
use App\Models\Concerns\HasMetadata;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\Response;

#[Fillable(['name', 'slug', 'image_path', 'metadata'])]
class Category extends Model
{
    use HasFactory, HasFeaturedPosition, HasMetadata;

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path
            ? asset('storage/'.$this->image_path)
            : null;
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

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (self $category): void {
            if ($category->products()->exists()) {
                abort(Response::HTTP_CONFLICT, 'No se puede eliminar la categoría porque tiene productos asociados.');
            }
        });
    }
}
