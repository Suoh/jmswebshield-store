<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

trait HasMetadata
{
    public function initializeHasMetadata(): void
    {
        $this->hidden[] = 'metadata_syscom_id';
    }

    public function scopeWhereHasMetadataKey(Builder $query, string $key): void
    {
        $query->whereNotNull('metadata');

        if (DB::connection()->getDriverName() === 'pgsql') {
            $query->whereRaw("metadata->>'{$key}' IS NOT NULL");
            $query->whereRaw("metadata->>'{$key}' != ''");
        } elseif (DB::connection()->getDriverName() === 'mysql') {
            $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.{$key}')) IS NOT NULL");
            $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.{$key}')) != ''");
        } else {
            $query->whereRaw("json_extract(metadata, '$.{$key}') IS NOT NULL");
            $query->whereRaw("json_extract(metadata, '$.{$key}') != ''");
        }
    }
}
