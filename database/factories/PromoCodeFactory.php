<?php

namespace Database\Factories;

use App\Models\PromoCode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PromoCode>
 */
class PromoCodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('????10')),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'discount_type' => PromoCode::DISCOUNT_TYPE_PERCENT,
            'discount_value' => fake()->randomElement([5, 10, 15, 20]),
            'min_subtotal' => 0,
            'max_discount' => null,
            'usage_limit' => null,
            'uses_count' => 0,
            'starts_at' => null,
            'expires_at' => null,
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the code grants a percentage discount.
     */
    public function percent(float $value = 10, ?float $max = null): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type' => PromoCode::DISCOUNT_TYPE_PERCENT,
            'discount_value' => $value,
            'max_discount' => $max,
        ]);
    }

    /**
     * Indicate that the code grants a fixed discount.
     */
    public function fixed(float $value = 5): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type' => PromoCode::DISCOUNT_TYPE_FIXED,
            'discount_value' => $value,
        ]);
    }
}
