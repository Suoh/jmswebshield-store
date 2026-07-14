<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->change();
            $table->string('session_id', 36)->nullable()->index()->after('product_id');
            $table->string('original_name')->nullable()->after('path');
            $table->unsignedInteger('size_bytes')->nullable()->after('original_name');
        });
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropColumn(['session_id', 'original_name', 'size_bytes']);
        });
    }
};
