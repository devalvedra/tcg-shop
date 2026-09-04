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
        DB::table('users')
            ->whereNotNull('shipping_address')
            ->orderBy('id')
            ->get()
            ->each(function (object $user): void {
                DB::table('addresses')->insert([
                    'user_id' => $user->id,
                    'receiver_name' => $user->name,
                    'address' => $user->shipping_address,
                    'city' => $user->shipping_city ?? '',
                    'zip' => $user->shipping_zip,
                    'is_default' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['shipping_address', 'shipping_city', 'shipping_zip']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('shipping_address')->nullable()->after('phone');
            $table->string('shipping_city')->nullable()->after('shipping_address');
            $table->string('shipping_zip')->nullable()->after('shipping_city');
        });
    }
};
