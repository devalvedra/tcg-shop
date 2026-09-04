<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Update the payment method codes to the merchant's payment numbers.
     */
    public function up(): void
    {
        DB::table('payment_methods')
            ->where('name', 'GCash')
            ->update(['code' => '09171234567']);

        DB::table('payment_methods')
            ->where('name', 'Maya')
            ->update(['code' => '09181234567']);

        DB::table('payment_methods')
            ->where('name', 'Bank Transfer')
            ->update(['code' => '1234-5678-9012']);
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        DB::table('payment_methods')
            ->where('name', 'GCash')
            ->update(['code' => 'gcash']);

        DB::table('payment_methods')
            ->where('name', 'Maya')
            ->update(['code' => 'maya']);

        DB::table('payment_methods')
            ->where('name', 'Bank Transfer')
            ->update(['code' => 'bank-transfer']);
    }
};
