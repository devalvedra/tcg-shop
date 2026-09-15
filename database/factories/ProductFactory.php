<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucfirst(rtrim(fake()->sentence(3), '.')),
            'description' => fake()->paragraph(),
            'youtube_link' => null,
            'category' => fn (): string => (ProductCategory::inRandomOrder()->first() ?? ProductCategory::factory()->create())->slug,
            'price' => fake()->randomFloat(2, 5, 300),
            'sell_price' => null,
            'down_payment' => 0,
            'stock' => fake()->numberBetween(0, 100),
            'status' => Product::STATUS_READY,
            'open_po_date' => null,
            'close_po_date' => null,
        ];
    }

    /**
     * Indicate that the product is available for pre-order.
     */
    public function preOrder(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Product::STATUS_PRE_ORDER,
            'open_po_date' => now()->subDays(7)->toDateString(),
            'close_po_date' => now()->addDays(30)->toDateString(),
        ]);
    }

    /**
     * Indicate that the product is unavailable.
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Product::STATUS_UNAVAILABLE,
        ]);
    }

    /**
     * Attach placeholder images to the product.
     */
    public function withImages(int $count = 1): static
    {
        return $this->afterCreating(function (Product $product) use ($count) {
            foreach (range(0, $count - 1) as $index) {
                $product->images()->create([
                    'image' => "products/{$product->id}-{$index}.jpg",
                    'sort_order' => $index,
                ]);
            }
        });
    }
}
