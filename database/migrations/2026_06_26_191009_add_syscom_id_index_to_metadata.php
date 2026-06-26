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

        DB::statement("CREATE INDEX IF NOT EXISTS products_metadata_syscom_id_idx ON products ((metadata->>'syscom_id'))");
        DB::statement("CREATE INDEX IF NOT EXISTS brands_metadata_syscom_id_idx ON brands ((metadata->>'syscom_id'))");
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return;
        }

        Schema::table('products', function ($table) {
            $table->dropIndex('products_metadata_syscom_id_idx');
        });

        Schema::table('brands', function ($table) {
            $table->dropIndex('brands_metadata_syscom_id_idx');
        });
    }
};
