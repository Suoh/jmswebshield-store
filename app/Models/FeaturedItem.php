<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['featurable_id', 'featurable_type', 'position'])]
class FeaturedItem extends Model
{
    use HasFactory;

    public function featurable(): MorphTo
    {
        return $this->morphTo();
    }
}
