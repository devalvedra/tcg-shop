<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Faker\Generator;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Seed the application with demo orders for the demo customer.
     */
    public function run(): void
    {
        if (! class_exists(Generator::class)) {
            $this->command->warn('OrderSeeder requires fakerphp/faker (a dev dependency); skipping.');

            return;
        }

        $customer = User::where('phone', '09170000001')->first() ?? User::factory()->create([
            'name' => 'Customer User',
            'phone' => '09170000001',
            'role' => User::ROLE_CUSTOMER,
            'email' => 'customer@example.com',
        ]);

        $products = Product::inRandomOrder()->limit(6)->get();
        $demoOrders = [
            ['status' => Order::STATUS_PENDING, 'payment_method' => '09171234567', 'payment_status' => Order::PAYMENT_STATUS_UNPAID],
            ['status' => Order::STATUS_CONFIRMED, 'payment_method' => '09171234567', 'payment_status' => Order::PAYMENT_STATUS_PAID],
            ['status' => Order::STATUS_PROCESSING, 'payment_method' => '09181234567', 'payment_status' => Order::PAYMENT_STATUS_PAID],
            ['status' => Order::STATUS_SHIPPED, 'payment_method' => '1234-5678-9012', 'payment_status' => Order::PAYMENT_STATUS_PAID],
            ['status' => Order::STATUS_COMPLETED, 'payment_method' => 'cod', 'payment_status' => Order::PAYMENT_STATUS_PAID],
        ];

        foreach ($demoOrders as $demo) {
            $order = Order::create([
                'customer_id' => $customer->id,
                'order_number' => 'ORD-'.now()->format('Ymd').'-'
                    .str_pad((string) ((int) Order::max('id') + 1), 5, '0', STR_PAD_LEFT),
                'status' => $demo['status'],
                'payment_method' => $demo['payment_method'],
                'payment_status' => $demo['payment_status'],
                'shipping_fee' => fake()->randomElement([0, 50, 100]),
                'discount' => 0,
                'notes' => fake()->boolean(30) ? fake()->sentence() : null,
            ]);

            $product = $products->random();
            $quantity = fake()->numberBetween(1, 3);
            $unitPrice = $product->sell_price ?? $product->price;

            $order->items()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_image' => null,
                'unit_price' => $unitPrice,
                'quantity' => $quantity,
                'subtotal' => round((float) $unitPrice * $quantity, 2),
            ]);

            $subtotal = round((float) $order->items->sum('subtotal'), 2);

            $order->forceFill([
                'subtotal' => $subtotal,
                'total' => max(0, $subtotal + (float) $order->shipping_fee - (float) $order->discount),
            ])->save();
        }
    }
}
