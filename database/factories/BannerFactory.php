<?php

namespace Database\Factories;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Banner>
 */
class BannerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => ucfirst(rtrim(fake()->sentence(3), '.')),
            'subtitle' => fake()->sentence(),
            'image' => null,
            'link_url' => null,
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the banner is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Attach a placeholder image to the banner.
     */
    public function withImage(): static
    {
        return $this->state(fn (array $attributes) => [
            'image' => "banners/{$this->faker->uuid()}.jpg",
        ]);
    }
}
