<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('short_description')->nullable();
            $table->text('full_description')->nullable();
            $table->integer('stock')->default(0);
            $table->decimal('price', 10, 2);
            $table->integer('discount')->default(0);
            $table->string('image_url')->nullable();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->string('model')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_id', 36)->nullable()->index();
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->unsignedInteger('size_bytes')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_cover')->default(false);
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('image_path')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('category_product', function (Blueprint $table) {
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unique(['category_id', 'product_id']);
        });

        Schema::create('editor_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_id', 36)->nullable()->index();
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->unsignedInteger('size_bytes')->nullable();
            $table->timestamps();
            $table->index(['product_id', 'created_at']);
        });

        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('image_path');
            $table->string('link_url')->nullable();
            $table->unsignedTinyInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('featured_items', function (Blueprint $table) {
            $table->id();
            $table->morphs('featurable');
            $table->unsignedSmallInteger('position')->default(0);
            $table->unique(['featurable_id', 'featurable_type']);
            $table->timestamps();
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement("CREATE INDEX IF NOT EXISTS products_metadata_syscom_id_idx ON products ((metadata->>'syscom_id'))");
            DB::statement("CREATE INDEX IF NOT EXISTS brands_metadata_syscom_id_idx ON brands ((metadata->>'syscom_id'))");
            DB::statement("CREATE INDEX IF NOT EXISTS categories_metadata_syscom_id_idx ON categories ((metadata->>'syscom_id'))");
        }

        if (DB::connection()->getDriverName() === 'mysql') {
            if ($this->isMariaDb()) {
                $this->createMariaDbSyscomIdIndex('products');
                $this->createMariaDbSyscomIdIndex('brands');
                $this->createMariaDbSyscomIdIndex('categories');
            } else {
                DB::statement("CREATE INDEX products_metadata_syscom_id_idx ON products ((CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.syscom_id')) AS CHAR(64))))");
                DB::statement("CREATE INDEX brands_metadata_syscom_id_idx ON brands ((CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.syscom_id')) AS CHAR(64))))");
                DB::statement("CREATE INDEX categories_metadata_syscom_id_idx ON categories ((CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.syscom_id')) AS CHAR(64))))");
            }
        }
    }

    private function isMariaDb(): bool
    {
        $version = DB::selectOne('SELECT VERSION() AS version')->version;

        return str_contains(strtolower($version), 'mariadb');
    }

    private function createMariaDbSyscomIdIndex(string $table): void
    {
        DB::statement(
            "ALTER TABLE {$table}
                ADD COLUMN metadata_syscom_id VARCHAR(64)
                    GENERATED ALWAYS AS (
                        JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.syscom_id'))
                    ) VIRTUAL,
                ADD INDEX {$table}_metadata_syscom_id_idx (metadata_syscom_id)"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('featured_items');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('editor_images');
        Schema::dropIfExists('category_product');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('brands');
    }
};
