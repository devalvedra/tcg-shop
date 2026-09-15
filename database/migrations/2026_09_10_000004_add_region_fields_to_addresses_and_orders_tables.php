<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->string('province')->nullable()->after('city');
            $table->string('district')->nullable()->after('province');
            $table->string('subdistrict')->nullable()->after('district');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_province')->nullable()->after('shipping_city');
            $table->string('shipping_district')->nullable()->after('shipping_province');
            $table->string('shipping_subdistrict')->nullable()->after('shipping_district');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn(['province', 'district', 'subdistrict']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_province', 'shipping_district', 'shipping_subdistrict']);
        });
    }
};
