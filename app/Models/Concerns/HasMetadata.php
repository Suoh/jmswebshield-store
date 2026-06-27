<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

trait HasMetadata
{
    public function scopeWhereHasMetadataKey(Builder $query, string $key): void
    {
        $query->whereNotNull('metadata');

        if (DB::connection()->getDriverName() === 'pgsql') {
            $query->whereRaw("metadata->>'{$key}' IS NOT NULL");
            $query->whereRaw("metadata->>'{$key}' != ''");
        } else {
            $query->whereRaw("json_extract(metadata, '$.{$key}') IS NOT NULL");
            $query->whereRaw("json_extract(metadata, '$.{$key}') != ''");
        }
    }
}
