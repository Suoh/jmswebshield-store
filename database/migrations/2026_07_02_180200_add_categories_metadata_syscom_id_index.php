<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement("CREATE INDEX IF NOT EXISTS categories_metadata_syscom_id_idx ON categories ((metadata->>'syscom_id'))");
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return;
        }

        Schema::table('categories', function ($table) {
            $table->dropIndex('categories_metadata_syscom_id_idx');
        });
    }
};
