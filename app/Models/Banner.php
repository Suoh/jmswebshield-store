<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'image_path', 'link_url', 'position', 'is_active'])]
class Banner extends Model
{
    use HasFactory;

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }

    public function getImageUrlAttribute(): string
    {
        return asset('storage/'.$this->image_path);
    }
}
