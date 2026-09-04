<?php

use App\Models\Product;
use Inertia\Testing\AssertableInertia as Assert;

test('the catalog lists ready and pre-order products', function () {
    Product::factory()->create(['name' => 'Charizard VMAX', 'status' => Product::STATUS_READY]);
    Product::factory()->preOrder()->create(['name' => 'Prismatic Evolutions Booster Box']);
    Product::factory()->unavailable()->create(['name' => 'Evolving Skies Booster Box']);

    $this->get(route('catalog'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/catalog')
            ->has('products.data', 2));
});

test('the catalog can be filtered by category', function () {
    Product::factory()->create(['category' => 'singles', 'name' => 'Charizard VMAX']);
    Product::factory()->create(['category' => 'booster-boxes', 'name' => 'Obsidian Flames Booster Box']);

    $this->get(route('catalog', ['category' => 'singles']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.category', 'singles'));
});

test('the catalog can be searched and sorted by price', function () {
    Product::factory()->create(['name' => 'Charizard VMAX', 'price' => '149.99', 'sell_price' => '129.99', 'status' => Product::STATUS_READY]);
    Product::factory()->create(['name' => 'Umbreon VMAX', 'price' => '199.99', 'status' => Product::STATUS_READY]);

    $this->get(route('catalog', ['sort' => 'price-asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('products.data.0.name', 'Charizard VMAX'));

    $this->get(route('catalog', ['search' => 'umbreon']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Umbreon VMAX'));
});

test('the catalog can be filtered to pre-orders only', function () {
    Product::factory()->preOrder()->create(['name' => 'Prismatic Evolutions Booster Box']);
    Product::factory()->create(['name' => 'Charizard VMAX', 'status' => Product::STATUS_READY]);

    $this->get(route('catalog', ['status' => Product::STATUS_PRE_ORDER]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.status', Product::STATUS_PRE_ORDER));
});

test('the catalog can be filtered to ready items only', function () {
    Product::factory()->create(['name' => 'Charizard VMAX', 'status' => Product::STATUS_READY]);
    Product::factory()->preOrder()->create(['name' => 'Prismatic Evolutions Booster Box']);

    $this->get(route('catalog', ['status' => Product::STATUS_READY]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.status', Product::STATUS_READY));
});
