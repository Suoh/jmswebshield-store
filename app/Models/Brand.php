<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

#[Fillable(['name', 'slug', 'metadata'])]
class Brand extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function scopeWhereHasSyscomId(Builder $query): void
    {
        $query->whereNotNull('metadata');

        if (DB::connection()->getDriverName() === 'pgsql') {
            $query->whereRaw("metadata->>'syscom_id' IS NOT NULL");
            $query->whereRaw("metadata->>'syscom_id' != ''");
        } else {
            $query->whereRaw("json_extract(metadata, '$.syscom_id') IS NOT NULL");
            $query->whereRaw("json_extract(metadata, '$.syscom_id') != ''");
        }
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
