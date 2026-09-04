<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 50, 1000);
        $shippingFee = fake()->randomFloat(2, 0, 100);
        $discount = fake()->randomFloat(2, 0, 50);

        return [
            'customer_id' => User::factory(),
            'status' => fake()->randomElement(Order::STATUSES),
            'payment_method' => fake()->randomElement(Order::PAYMENT_METHODS),
            'payment_status' => fake()->randomElement(Order::PAYMENT_STATUSES),
            'subtotal' => $subtotal,
            'shipping_fee' => $shippingFee,
            'discount' => $discount,
            'total' => max(0, $subtotal + $shippingFee - $discount),
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }

    /**
     * Attach line items to the order and recompute the totals.
     */
    public function withItems(int $count = 1): static
    {
        return $this->afterCreating(function (Order $order) use ($count) {
            $products = Product::factory()->count($count)->create();

            foreach ($products as $product) {
                $quantity = fake()->numberBetween(1, 5);
                $unitPrice = $product->sell_price ?? $product->price;

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image' => null,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'subtotal' => round((float) $unitPrice * $quantity, 2),
                ]);
            }

            $subtotal = round((float) $order->items->sum('subtotal'), 2);

            $order->forceFill([
                'subtotal' => $subtotal,
                'total' => max(0, $subtotal + (float) $order->shipping_fee - (float) $order->discount),
            ])->save();
        });
    }
}
