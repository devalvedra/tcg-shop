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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        DB::table('settings')->insert([
            ['key' => 'store_name', 'value' => 'TCG Shop', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'store_email', 'value' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'store_phone', 'value' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'store_address', 'value' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'shipping_fee', 'value' => '5.00', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'free_shipping_threshold', 'value' => '100.00', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
