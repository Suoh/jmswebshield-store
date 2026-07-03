<?php

namespace App\Jobs;

use App\Models\EditorImage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CleanupOrphanEditorImages implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        EditorImage::orphans()->each(function (EditorImage $image): void {
            $image->delete();
        });
    }
}
