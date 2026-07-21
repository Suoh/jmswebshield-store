<?php

namespace App\Models;

use App\Models\Concerns\HasMetadata;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

#[Fillable(['name', 'slug', 'metadata'])]
class Brand extends Model
{
    use HasFactory, HasMetadata;

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
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

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
