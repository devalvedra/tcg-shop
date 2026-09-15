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
        DB::table('orders')
            ->where('down_payment_status', 'paid')
            ->where('down_payment', '>', 0)
            ->update(['payment_status' => 'dp']);

        DB::table('orders')
            ->where('payment_status', 'refunded')
            ->update(['payment_status' => 'unpaid']);

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('down_payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('down_payment_status')->default('unpaid')->after('down_payment');
        });

        DB::table('orders')
            ->where('payment_status', 'dp')
            ->update(['payment_status' => 'paid', 'down_payment_status' => 'paid']);
    }
};
