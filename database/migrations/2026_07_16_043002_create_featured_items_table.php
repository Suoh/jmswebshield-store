<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('featured_items', function (Blueprint $table): void {
            $table->id();
            $table->morphs('featurable');
            $table->unsignedSmallInteger('position')->default(0);
            $table->unique(['featurable_id', 'featurable_type']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('featured_items');
    }
};
