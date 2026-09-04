<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login when visiting my orders', function () {
    $this->get(route('orders.index'))->assertRedirect(route('login'));
});

test('a customer can view their order history', function () {
    $user = User::factory()->create();
    Order::factory()->count(3)->create([
        'customer_id' => $user->id,
        'down_payment' => '0.00',
    ]);
    Order::factory()->create([
        'customer_id' => $user->id,
        'down_payment' => '50.00',
        'created_at' => now()->addMinutes(5),
    ]);

    $this->actingAs($user)
        ->get(route('orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/orders/index')
            ->has('orders.data', 4)
            ->where('orders.data.0.down_payment', '50.00'));
});

test('a customer only sees their own orders', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    Order::factory()->create(['customer_id' => $user->id]);
    Order::factory()->create(['customer_id' => $other->id]);

    $this->actingAs($user)
        ->get(route('orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.customer_id', $user->id));
});

test('the order history shows an empty state', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/orders/index')
            ->has('orders.data', 0));
});

test('a customer can view an order detail page', function () {
    $user = User::factory()->create();
    $order = Order::factory()->withItems(2)->create([
        'customer_id' => $user->id,
        'down_payment' => '50.00',
    ]);

    $this->actingAs($user)
        ->get(route('orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/orders/show')
            ->where('order.id', $order->id)
            ->where('order.down_payment', '50.00')
            ->has('order.items', 2)
            ->has('downPaymentStatuses'));
});

test('an order item product image is exposed as a public url', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $order = Order::factory()->create(['customer_id' => $user->id]);
    $order->items()->create([
        'product_name' => 'Charizard VMAX',
        'product_image' => 'products/1-0.jpg',
        'unit_price' => '50.00',
        'quantity' => 1,
        'subtotal' => '50.00',
    ]);

    $this->actingAs($user)
        ->get(route('orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/orders/show')
            ->where('order.items.0.product_image', 'products/1-0.jpg')
            ->where('order.items.0.product_image_url', '/storage/products/1-0.jpg'));
});

test('a customer cannot view another customers order', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $order = Order::factory()->create(['customer_id' => $owner->id]);

    $this->actingAs($other)
        ->get(route('orders.show', $order))
        ->assertForbidden();
});

test('a customer can cancel their pending order and restock the items', function () {
    $customer = User::factory()->create();
    $product = Product::factory()->create([
        'name' => 'Charizard VMAX',
        'status' => Product::STATUS_READY,
        'stock' => 5,
    ]);
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PENDING,
    ]);
    $order->items()->create([
        'product_id' => $product->id,
        'product_name' => 'Charizard VMAX',
        'unit_price' => '50.00',
        'quantity' => 2,
        'subtotal' => '100.00',
    ]);

    $this->actingAs($customer)
        ->delete(route('orders.cancel', $order))
        ->assertRedirect();

    expect($order->fresh()->status)->toBe(Order::STATUS_CANCELLED);
    expect($product->fresh()->stock)->toBe(7);
});

test('only pending orders can be cancelled', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_CONFIRMED,
    ]);

    $this->actingAs($customer)
        ->delete(route('orders.cancel', $order))
        ->assertRedirect();

    expect($order->fresh()->status)->toBe(Order::STATUS_CONFIRMED);
});

test('a customer cannot cancel another customers order', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $order = Order::factory()->create([
        'customer_id' => $owner->id,
        'status' => Order::STATUS_PENDING,
    ]);

    $this->actingAs($other)
        ->delete(route('orders.cancel', $order))
        ->assertForbidden();
});
