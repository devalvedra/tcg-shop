<?php

use App\Models\Product;
use Inertia\Testing\AssertableInertia as Assert;

test('a guest can add a product to the cart', function () {
    $product = Product::factory()->create([
        'name' => 'Charizard VMAX',
        'status' => Product::STATUS_READY,
        'stock' => 10,
    ]);

    $this->post(route('cart.store', $product), ['quantity' => 2])
        ->assertRedirect();

    $this->assertSame(2, session('cart.items.'.$product->id));
});

test('adding a product flashes a success toast', function () {
    $product = Product::factory()->create(['status' => Product::STATUS_READY]);

    $this->post(route('cart.store', $product), ['quantity' => 1])
        ->assertRedirect()
        ->assertInertiaFlash('toast');
});

test('stock limits are enforced when adding to the cart', function () {
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 3,
    ]);

    $this->post(route('cart.store', $product), ['quantity' => 4])
        ->assertRedirect();

    $this->assertNull(session('cart.items.'.$product->id));
});

test('unavailable products cannot be added to the cart', function () {
    $product = Product::factory()->unavailable()->create();

    $this->post(route('cart.store', $product), ['quantity' => 1])
        ->assertRedirect();

    $this->assertNull(session('cart.items.'.$product->id));
});

test('a pre-order product outside its pre-order window cannot be added', function () {
    $product = Product::factory()->preOrder()->create([
        'open_po_date' => now()->subDays(7)->toDateString(),
        'close_po_date' => now()->subDays(3)->toDateString(),
    ]);

    $this->post(route('cart.store', $product), ['quantity' => 1])
        ->assertRedirect();

    $this->assertNull(session('cart.items.'.$product->id));
});

test('quantity is required and must be positive', function () {
    $product = Product::factory()->create(['status' => Product::STATUS_READY]);

    $this->post(route('cart.store', $product), ['quantity' => 0])
        ->assertSessionHasErrors('quantity');
});

test('a cart item quantity can be updated', function () {
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 10,
    ]);
    session(['cart.items' => [$product->id => 2]]);

    $this->patch(route('cart.update', $product), ['quantity' => 5])
        ->assertRedirect();

    $this->assertSame(5, session('cart.items.'.$product->id));
});

test('updating a cart item beyond available stock is rejected', function () {
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 2,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    $this->patch(route('cart.update', $product), ['quantity' => 5])
        ->assertRedirect();

    $this->assertSame(1, session('cart.items.'.$product->id));
});

test('a cart item can be removed', function () {
    $product = Product::factory()->create(['status' => Product::STATUS_READY]);
    session(['cart.items' => [$product->id => 3]]);

    $this->delete(route('cart.destroy', $product))->assertRedirect();

    $this->assertNull(session('cart.items.'.$product->id));
});

test('the cart page renders its items and totals', function () {
    $product = Product::factory()->create([
        'name' => 'Charizard VMAX',
        'status' => Product::STATUS_READY,
        'price' => '50.00',
        'stock' => 10,
    ]);
    session(['cart.items' => [$product->id => 2]]);

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/cart')
            ->has('cartItems', 1)
            ->where('cartItems.0.product.name', 'Charizard VMAX')
            ->where('cartItems.0.quantity', 2)
            ->where('subtotal', 100)
            ->where('total', 100));
});

test('the cart page shows an empty state', function () {
    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/cart')
            ->where('cartItems', []));
});

test('a pre-order item is priced at its full price with a separate down payment', function () {
    $product = Product::factory()->preOrder()->create([
        'name' => 'Paradox Rift Booster Box',
        'price' => '149.99',
        'stock' => 10,
    ]);
    session([
        'cart.items' => [$product->id => 2],
        'cart.down_payments' => [$product->id => 50],
    ]);

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/cart')
            ->where('cartItems.0.unit_price', 149.99)
            ->where('cartItems.0.subtotal', 299.98)
            ->where('cartItems.0.down_payment', 50)
            ->where('subtotal', 299.98)
            ->where('downPayment', 50)
            ->where('total', 299.98));
});

test('a pre-order item without a down payment is priced at its full price', function () {
    $product = Product::factory()->preOrder()->create([
        'price' => '149.99',
        'stock' => 10,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/cart')
            ->where('cartItems.0.unit_price', 149.99)
            ->where('cartItems.0.subtotal', 149.99)
            ->where('cartItems.0.down_payment', 0)
            ->where('downPayment', 0));
});

test('a pre-order down payment is stored when adding to the cart', function () {
    $product = Product::factory()->preOrder()->create([
        'price' => '100.00',
        'stock' => 10,
    ]);

    $this->post(route('cart.store', $product), [
        'quantity' => 2,
        'down_payment' => 150,
    ])->assertRedirect();

    $this->assertSame(2, session('cart.items.'.$product->id));
    $this->assertSame(150.0, (float) session('cart.down_payments.'.$product->id));
});

test('a pre-order product cannot exceed its available stock', function () {
    $product = Product::factory()->preOrder()->create([
        'price' => '100.00',
        'stock' => 2,
    ]);

    $this->post(route('cart.store', $product), ['quantity' => 3])
        ->assertRedirect();

    $this->assertNull(session('cart.items.'.$product->id));
});

test('a pre-order quantity update beyond stock is rejected', function () {
    $product = Product::factory()->preOrder()->create([
        'price' => '100.00',
        'stock' => 2,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    $this->patch(route('cart.update', $product), ['quantity' => 5])
        ->assertRedirect();

    $this->assertSame(1, session('cart.items.'.$product->id));
});

test('a down payment must be lower than the item subtotal', function () {
    $product = Product::factory()->preOrder()->create([
        'price' => '100.00',
        'stock' => 10,
    ]);

    $this->post(route('cart.store', $product), [
        'quantity' => 2,
        'down_payment' => 200,
    ])->assertRedirect();

    $this->assertNull(session('cart.items.'.$product->id));
});

test('a ready product ignores any submitted down payment', function () {
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'price' => '100.00',
    ]);

    $this->post(route('cart.store', $product), [
        'quantity' => 1,
        'down_payment' => 50,
    ])->assertRedirect();

    $this->assertSame(1, session('cart.items.'.$product->id));
    $this->assertNull(session('cart.down_payments.'.$product->id));
});

test('a cart item down payment can be updated', function () {
    $product = Product::factory()->preOrder()->create([
        'price' => '100.00',
    ]);
    session([
        'cart.items' => [$product->id => 1],
        'cart.down_payments' => [$product->id => 25],
    ]);

    $this->patch(route('cart.update', $product), ['down_payment' => 60])
        ->assertRedirect();

    $this->assertSame(60.0, (float) session('cart.down_payments.'.$product->id));
});

test('a cart item down payment above the subtotal is rejected', function () {
    $product = Product::factory()->preOrder()->create([
        'price' => '100.00',
    ]);
    session([
        'cart.items' => [$product->id => 1],
        'cart.down_payments' => [$product->id => 25],
    ]);

    $this->patch(route('cart.update', $product), ['down_payment' => 100])
        ->assertRedirect();

    $this->assertSame(25.0, (float) session('cart.down_payments.'.$product->id));
});

test('removing a cart item also removes its down payment', function () {
    $product = Product::factory()->preOrder()->create();
    session([
        'cart.items' => [$product->id => 1],
        'cart.down_payments' => [$product->id => 25],
    ]);

    $this->delete(route('cart.destroy', $product))->assertRedirect();

    $this->assertNull(session('cart.items.'.$product->id));
    $this->assertNull(session('cart.down_payments.'.$product->id));
});

test('cart quantities are clamped when stock drops below the cart quantity', function () {
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 2,
    ]);
    session(['cart.items' => [$product->id => 5]]);

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('cartItems', 1)
            ->where('cartItems.0.quantity', 2));

    $this->assertSame(2, session('cart.items.'.$product->id));
});

test('items that are no longer available are removed from the cart', function () {
    $product = Product::factory()->unavailable()->create(['stock' => 4]);
    session(['cart.items' => [$product->id => 2]]);

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('cartItems', []));

    $this->assertNull(session('cart.items.'.$product->id));
});

test('out of stock items are removed from the cart', function () {
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 0,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('cartItems', []));

    $this->assertNull(session('cart.items.'.$product->id));
});
