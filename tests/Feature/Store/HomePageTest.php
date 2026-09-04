<?php

use App\Models\Product;
use Database\Seeders\ProductCategorySeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('the storefront home page shows featured and pre-order products', function () {
    $this->seed(ProductCategorySeeder::class);

    Product::factory()->create(['name' => 'Charizard VMAX', 'status' => Product::STATUS_READY]);
    Product::factory()->preOrder()->create(['name' => 'Prismatic Evolutions Booster Box']);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/index')
            ->has('featuredProducts', 1)
            ->where('featuredProducts.0.name', 'Charizard VMAX')
            ->has('preOrderProducts', 1)
            ->where('preOrderProducts.0.status', Product::STATUS_PRE_ORDER)
            ->has('categories', 5));
});

test('the home page lists categories from the seeded list', function () {
    $this->seed(ProductCategorySeeder::class);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/index')
            ->where('categories.0.key', 'accessories')
            ->where('categories.0.label', 'Accessories')
            ->where('categories.4.key', 'singles')
            ->where('categories.4.label', 'Singles'));
});

test('unavailable products are not shown on the home page', function () {
    Product::factory()->create(['status' => Product::STATUS_UNAVAILABLE, 'name' => 'Hidden Product']);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('featuredProducts', [])
            ->where('preOrderProducts', []));
});
