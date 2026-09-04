<?php

use App\Models\Product;
use Inertia\Testing\AssertableInertia as Assert;

test('a product detail page can be viewed', function () {
    $product = Product::factory()->withImages(2)->create([
        'name' => 'Charizard VMAX',
    ]);

    $this->get(route('products.show', ['product' => $product->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/products/show')
            ->where('product.name', 'Charizard VMAX')
            ->where('product.slug', 'charizard-vmax')
            ->has('product.images', 2));
});

test('the product detail page resolves by slug', function () {
    $product = Product::factory()->create([
        'name' => 'Umbreon Ex',
    ]);

    $this->get(route('products.show', ['product' => $product->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('product.slug', 'umbreon-ex'));
});

test('the product detail page exposes the available stock and cart quantity', function () {
    $product = Product::factory()->create([
        'name' => 'Charizard VMAX',
        'status' => Product::STATUS_READY,
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 2]]);

    $this->get(route('products.show', ['product' => $product->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/products/show')
            ->where('product.stock', 5)
            ->where('cartQuantity', 2));
});

test('unavailable products return a 404 on the detail page', function () {
    $product = Product::factory()->unavailable()->create();

    $this->get(route('products.show', ['product' => $product->slug]))->assertNotFound();
});

test('recommended products from the same category are shown', function () {
    $product = Product::factory()->create([
        'name' => 'Charizard VMAX',
        'category' => 'singles',
    ]);

    $recommended = [
        Product::factory()->create([
            'category' => 'singles',
            'created_at' => now()->subMinutes(4),
        ]),
        Product::factory()->create([
            'category' => 'singles',
            'created_at' => now()->subMinutes(3),
        ]),
        Product::factory()->create([
            'category' => 'singles',
            'created_at' => now()->subMinutes(2),
        ]),
        Product::factory()->create([
            'category' => 'singles',
            'created_at' => now()->subMinutes(1),
        ]),
    ];

    Product::factory()->count(2)->create([
        'category' => 'booster-boxes',
    ]);

    $this->get(route('products.show', ['product' => $product->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->count('recommended', 4)
            ->where('recommended.0.id', $recommended[3]->id)
            ->where('recommended.1.id', $recommended[2]->id)
            ->where('recommended.2.id', $recommended[1]->id)
            ->where('recommended.3.id', $recommended[0]->id));
});

test('unavailable products are excluded from recommendations', function () {
    $product = Product::factory()->create([
        'name' => 'Charizard VMAX',
        'category' => 'singles',
    ]);

    Product::factory()->count(3)->unavailable()->create([
        'category' => 'singles',
    ]);

    Product::factory()->count(2)->create([
        'category' => 'singles',
    ]);

    $this->get(route('products.show', ['product' => $product->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->count('recommended', 2));
});
