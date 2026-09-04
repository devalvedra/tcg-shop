<?php

use App\Models\Address;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\ShopSetting;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login when visiting checkout', function () {
    $this->get(route('checkout.index'))->assertRedirect(route('login'));
});

test('an empty cart redirects to the cart page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('checkout.index'))
        ->assertRedirect(route('cart.index'));
});

test('the checkout page exposes the admin WhatsApp number for order confirmation', function () {
    $user = User::factory()->create([
        'name' => 'Ash Ketchum',
    ]);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    ShopSetting::setMany(['whatsapp_number' => '+639170000001']);

    $this->actingAs($user)
        ->get(route('checkout.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/checkout')
            ->where('whatsappNumber', '+639170000001')
            ->where('customerName', 'Ash Ketchum'));
});

test('a customer with items can view the checkout page', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create([
        'name' => 'Charizard VMAX',
        'status' => Product::STATUS_READY,
        'price' => '50.00',
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 2]]);

    $this->actingAs($user)
        ->get(route('checkout.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/checkout')
            ->has('cartItems', 1)
            ->where('cartItems.0.product.name', 'Charizard VMAX')
            ->has('paymentMethods', 4)
            ->has('addresses'));
});

test('a customer can place an order from the cart', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);
    $product = Product::factory()->create([
        'name' => 'Charizard VMAX',
        'status' => Product::STATUS_READY,
        'price' => '100.00',
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 2]]);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => '09171234567',
        ])
        ->assertRedirect();

    $order = Order::where('customer_id', $user->id)->firstOrFail();

    $this->assertSame(Order::STATUS_PENDING, $order->status);
    $this->assertSame('09171234567', $order->payment_method);
    $this->assertSame(Order::PAYMENT_STATUS_UNPAID, $order->payment_status);
    $this->assertSame('200.00', $order->total);
    $this->assertSame('0.00', $order->down_payment);
    $this->assertSame(Order::DOWN_PAYMENT_STATUS_UNPAID, $order->down_payment_status);

    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_name' => 'Charizard VMAX',
        'quantity' => 2,
        'unit_price' => '100.00',
        'subtotal' => '200.00',
    ]);

    $this->assertSame(3, $product->fresh()->stock);
    $this->assertNull(session('cart.items'));
});

test('shipping address is snapshotted from the selected address', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create([
        'user_id' => $user->id,
        'receiver_name' => 'Ash Ketchum',
        'address' => '123 Card Lane',
        'city' => 'Makati',
        'zip' => '1234',
    ]);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ])
        ->assertRedirect();

    $order = Order::where('customer_id', $user->id)->firstOrFail();

    $this->assertSame('Ash Ketchum', $order->receiver_name);
    $this->assertSame('123 Card Lane', $order->shipping_address);
    $this->assertSame('Makati', $order->shipping_city);
    $this->assertSame('1234', $order->shipping_zip);
});

test('a customer cannot place an order with someone elses address', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $other->id]);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ])
        ->assertSessionHasErrors('address_id');

    $this->assertDatabaseMissing('orders', ['customer_id' => $user->id]);
});

test('stock is re-validated when placing an order', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 1,
    ]);
    session(['cart.items' => [$product->id => 3]]);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => 'cod',
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('orders', ['customer_id' => $user->id]);
    $this->assertSame(1, $product->fresh()->stock);
});

test('payment method is required at checkout', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => '',
        ])
        ->assertSessionHasErrors('payment_method');
});

test('inactive payment methods are hidden from checkout', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    PaymentMethod::where('code', '09171234567')->update(['is_active' => false]);

    $this->actingAs($user)
        ->get(route('checkout.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('paymentMethods', 3)
            ->where('paymentMethods.0.code', '09181234567'));
});

test('an inactive payment method is rejected at checkout', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 5,
    ]);
    session(['cart.items' => [$product->id => 1]]);

    PaymentMethod::where('code', '09171234567')->update(['is_active' => false]);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => '09171234567',
        ])
        ->assertSessionHasErrors('payment_method');

    $this->assertDatabaseMissing('orders', ['customer_id' => $user->id]);
});

test('a customer can view their order confirmation', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create(['customer_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('orders.confirmation', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/orders/confirmation')
            ->where('order.id', $order->id));
});

test('a customer cannot view another customers order confirmation', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $order = Order::factory()->create(['customer_id' => $owner->id]);

    $this->actingAs($other)
        ->get(route('orders.confirmation', $order))
        ->assertForbidden();
});

test('a pre-order product is charged its full price with the chosen down payment', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);
    $product = Product::factory()->preOrder()->create([
        'name' => 'Paradox Rift Booster Box',
        'price' => '149.99',
        'stock' => 10,
    ]);
    session([
        'cart.items' => [$product->id => 2],
        'cart.down_payments' => [$product->id => 150],
    ]);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => '09171234567',
        ])
        ->assertRedirect();

    $order = Order::where('customer_id', $user->id)->firstOrFail();

    $this->assertSame('299.98', $order->subtotal);
    $this->assertSame('299.98', $order->total);
    $this->assertSame('150.00', $order->down_payment);
    $this->assertSame(Order::DOWN_PAYMENT_STATUS_UNPAID, $order->down_payment_status);

    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_price' => '149.99',
        'subtotal' => '299.98',
    ]);

    $this->assertSame(10, $product->fresh()->stock);
});

test('a pre-order product outside its pre-order window is rejected at checkout', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);
    $product = Product::factory()->preOrder()->create([
        'open_po_date' => now()->subDays(7)->toDateString(),
        'close_po_date' => now()->subDays(3)->toDateString(),
        'price' => '149.99',
    ]);
    session(['cart.items' => [$product->id => 1]]);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
            'payment_method' => '09171234567',
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('orders', ['customer_id' => $user->id]);
});

test('the checkout page exposes the total down payment', function () {
    $user = User::factory()->create();
    $product = Product::factory()->preOrder()->create([
        'price' => '149.99',
        'stock' => 10,
    ]);
    session([
        'cart.items' => [$product->id => 1],
        'cart.down_payments' => [$product->id => 50],
    ]);

    $this->actingAs($user)
        ->get(route('checkout.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/checkout')
            ->where('cartItems.0.down_payment', 50)
            ->where('downPayment', 50)
            ->where('total', 149.99));
});
