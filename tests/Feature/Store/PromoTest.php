<?php

use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login when applying a promo code', function () {
    $this->post(route('promo.apply'), ['code' => 'SUMMER10'])
        ->assertRedirect(route('login'));
});

test('a customer can apply a valid promo code', function () {
    $user = User::factory()->create();
    PromoCode::factory()->percent(10)->create(['code' => 'SUMMER10']);
    $product = Product::factory()->create(['status' => Product::STATUS_READY, 'stock' => 5]);
    session(['cart.items' => [$product->id => 2]]);

    $this->actingAs($user)
        ->from(route('checkout.index'))
        ->post(route('promo.apply'), ['code' => 'summer10'])
        ->assertRedirect(route('checkout.index'));

    $this->assertSame('SUMMER10', session('cart.promo'));
});

test('applying an invalid promo code shows an error', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['status' => Product::STATUS_READY, 'stock' => 5]);
    session(['cart.items' => [$product->id => 1]]);

    $this->actingAs($user)
        ->post(route('promo.apply'), ['code' => 'NOPE'])
        ->assertRedirect();

    $this->assertNull(session('cart.promo'));
});

test('a promo code below the minimum subtotal cannot be applied', function () {
    $user = User::factory()->create();
    PromoCode::factory()->create([
        'code' => 'MIN100',
        'discount_type' => PromoCode::DISCOUNT_TYPE_PERCENT,
        'discount_value' => 10,
        'min_subtotal' => 100,
    ]);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'price' => '50.00',
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    $this->actingAs($user)
        ->post(route('promo.apply'), ['code' => 'MIN100'])
        ->assertRedirect();

    $this->assertNull(session('cart.promo'));
});

test('an expired promo code cannot be applied', function () {
    $user = User::factory()->create();
    PromoCode::factory()->create([
        'code' => 'EXPIRED',
        'discount_type' => PromoCode::DISCOUNT_TYPE_PERCENT,
        'discount_value' => 10,
        'expires_at' => now()->subDay(),
    ]);
    $product = Product::factory()->create(['status' => Product::STATUS_READY, 'stock' => 5]);
    session(['cart.items' => [$product->id => 1]]);

    $this->actingAs($user)
        ->post(route('promo.apply'), ['code' => 'EXPIRED'])
        ->assertRedirect();

    $this->assertNull(session('cart.promo'));
});

test('a customer can remove the applied promo code', function () {
    $user = User::factory()->create();
    session(['cart.promo' => 'SUMMER10']);

    $this->actingAs($user)
        ->delete(route('promo.remove'))
        ->assertRedirect();

    $this->assertNull(session('cart.promo'));
});

test('the checkout page shows the applied promo and discount', function () {
    $user = User::factory()->create();
    $promo = PromoCode::factory()->percent(10, 25)->create([
        'code' => 'SUMMER10',
        'name' => 'Summer sale',
    ]);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'price' => '100.00',
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 2]]);
    session(['cart.promo' => 'SUMMER10']);

    $this->actingAs($user)
        ->get(route('checkout.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/checkout')
            ->where('promo.code', 'SUMMER10')
            ->where('promo.name', 'Summer sale')
            ->where('promo.discount', 20)
            ->where('discount', 20)
            ->where('total', 180));
});

test('placing an order applies the promo discount and records the code', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);
    $promo = PromoCode::factory()->percent(10)->create([
        'code' => 'SUMMER10',
        'usage_limit' => 5,
    ]);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'price' => '100.00',
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 2]]);
    session(['cart.promo' => 'SUMMER10']);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => '09171234567',
        ])
        ->assertRedirect();

    $order = Order::where('customer_id', $user->id)->firstOrFail();

    $this->assertSame('20.00', $order->discount);
    $this->assertSame('180.00', $order->total);
    $this->assertSame($promo->id, $order->promo_code_id);
    $this->assertSame(1, $promo->fresh()->uses_count);
    $this->assertNull(session('cart.promo'));
});

test('placing an order with a fixed promo applies the fixed discount', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);
    $promo = PromoCode::factory()->fixed(5)->create(['code' => 'SAVE5']);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'price' => '50.00',
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 1]]);
    session(['cart.promo' => 'SAVE5']);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ])
        ->assertRedirect();

    $order = Order::where('customer_id', $user->id)->firstOrFail();

    $this->assertSame('5.00', $order->discount);
    $this->assertSame($promo->id, $order->promo_code_id);
    $this->assertSame(1, $promo->fresh()->uses_count);
});

test('an invalid promo in the session is ignored at checkout', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);
    PromoCode::factory()->create(['code' => 'EXPIRED', 'expires_at' => now()->subDay()]);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'price' => '50.00',
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 1]]);
    session(['cart.promo' => 'EXPIRED']);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ])
        ->assertRedirect();

    $order = Order::where('customer_id', $user->id)->firstOrFail();

    $this->assertSame('0.00', $order->discount);
    $this->assertSame('55.00', $order->total);
    $this->assertNull($order->promo_code_id);
});

test('the order detail shows the promo code used', function () {
    $user = User::factory()->create();
    $promo = PromoCode::factory()->percent(10)->create(['code' => 'SUMMER10']);
    $order = Order::factory()->create([
        'customer_id' => $user->id,
        'promo_code_id' => $promo->id,
        'discount' => '10.00',
    ]);

    $this->actingAs($user)
        ->get(route('orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/orders/show')
            ->where('order.promo_code.code', 'SUMMER10'));
});
