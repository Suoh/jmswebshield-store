<?php

namespace App\Models\Concerns;

use App\Models\FeaturedItem;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphOne;

trait HasFeaturedPosition
{
    public function featuredPosition(): MorphOne
    {
        return $this->morphOne(FeaturedItem::class, 'featurable');
    }

    public function scopeFeatured(Builder $query): void
    {
        $query->whereHas('featuredPosition');
    }
}
