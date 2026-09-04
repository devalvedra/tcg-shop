<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        DB::table('products')->orderBy('id')->each(function (object $product) {
            $base = Str::slug($product->name);
            $slug = $base;
            $i = 2;

            while (DB::table('products')
                ->where('slug', $slug)
                ->where('id', '!=', $product->id)
                ->exists()) {
                $slug = "{$base}-{$i}";
                $i++;
            }

            DB::table('products')->where('id', $product->id)->update(['slug' => $slug]);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
