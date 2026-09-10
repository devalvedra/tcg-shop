<?php

use App\Models\Product;
use App\Models\ProductCategory;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    ProductCategory::factory()->create(['name' => 'Singles', 'slug' => 'singles']);
    ProductCategory::factory()->create(['name' => 'Booster Boxes', 'slug' => 'booster-boxes']);
});

test('catalog filters by category', function () {
    Product::factory()->create(['name' => 'Charizard', 'category' => 'singles', 'status' => Product::STATUS_READY]);
    Product::factory()->create(['name' => 'Booster', 'category' => 'booster-boxes', 'status' => Product::STATUS_READY]);

    $this->get(route('catalog', ['category' => 'singles']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/catalog')
            ->has('products.data', 1)
            ->where('products.data.0.category', 'singles'));
});

test('catalog filters by status', function () {
    Product::factory()->preOrder()->create(['name' => 'Booster', 'category' => 'booster-boxes']);
    Product::factory()->create(['name' => 'Charizard', 'category' => 'singles', 'status' => Product::STATUS_READY]);

    $this->get(route('catalog', ['status' => Product::STATUS_PRE_ORDER]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/catalog')
            ->has('products.data', 1)
            ->where('products.data.0.status', Product::STATUS_PRE_ORDER));
});

test('catalog sorts by price ascending', function () {
    Product::factory()->create(['name' => 'Expensive', 'category' => 'singles', 'status' => Product::STATUS_READY, 'price' => '200.00']);
    Product::factory()->create(['name' => 'Cheap', 'category' => 'singles', 'status' => Product::STATUS_READY, 'price' => '20.00']);

    $this->get(route('catalog', ['sort' => 'price-asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/catalog')
            ->where('products.data.0.name', 'Cheap'));
});
