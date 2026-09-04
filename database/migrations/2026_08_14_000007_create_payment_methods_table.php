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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('description')->nullable();
            $table->text('instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        DB::table('payment_methods')->insert([
            [
                'name' => 'GCash',
                'code' => 'gcash',
                'description' => 'Pay instantly with your GCash wallet',
                'instructions' => 'Send your payment to our GCash number and use your order number as the reference. Upload the receipt to your order so we can confirm it.',
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Maya',
                'code' => 'maya',
                'description' => 'Pay instantly with your Maya wallet',
                'instructions' => 'Send your payment to our Maya account and use your order number as the reference. Upload the receipt to your order so we can confirm it.',
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bank Transfer',
                'code' => 'bank-transfer',
                'description' => 'Pay via bank transfer',
                'instructions' => 'Transfer to our bank account and include your order number in the reference field. Upload the receipt to your order so we can confirm it.',
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cash on Delivery',
                'code' => 'cod',
                'description' => 'Pay in cash when your order is delivered',
                'instructions' => 'Have your payment ready in cash when your order arrives at your shipping address.',
                'is_active' => true,
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
