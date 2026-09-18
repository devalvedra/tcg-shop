<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\ShopSetting;
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
            ->has('cancelOrder')
            ->has('paymentStatuses'));
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

test('a pending order outside the cancellation window cannot be cancelled', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PENDING,
        'created_at' => now()->subHours(5),
    ]);

    $this->actingAs($customer)
        ->delete(route('orders.cancel', $order))
        ->assertRedirect();

    expect($order->fresh()->status)->toBe(Order::STATUS_PENDING);
});

test('order cancellation can be disabled in the settings', function () {
    $customer = User::factory()->create();
    ShopSetting::setMany(['cancel_order_enabled' => '0']);
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PENDING,
    ]);

    $this->actingAs($customer)
        ->delete(route('orders.cancel', $order))
        ->assertRedirect();

    expect($order->fresh()->status)->toBe(Order::STATUS_PENDING);
});

test('a customer can update the payment status of an open order', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_STATUS_UNPAID,
    ]);

    $this->actingAs($customer)
        ->put(route('orders.payment', $order), [
            'payment_status' => Order::PAYMENT_STATUS_DP,
        ])
        ->assertRedirect();

    expect($order->fresh()->payment_status)->toBe(Order::PAYMENT_STATUS_DP);
});

test('the payment status cannot be changed on a cancelled or completed order', function () {
    $customer = User::factory()->create();

    foreach ([Order::STATUS_CANCELLED, Order::STATUS_COMPLETED] as $status) {
        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'status' => $status,
            'payment_status' => Order::PAYMENT_STATUS_UNPAID,
        ]);

        $this->actingAs($customer)
            ->put(route('orders.payment', $order), [
                'payment_status' => Order::PAYMENT_STATUS_PAID,
            ])
            ->assertRedirect();

        expect($order->fresh()->payment_status)->toBe(Order::PAYMENT_STATUS_UNPAID);
    }
});

test('an invalid payment status is rejected', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_STATUS_UNPAID,
    ]);

    $this->actingAs($customer)
        ->put(route('orders.payment', $order), [
            'payment_status' => 'not-a-status',
        ])
        ->assertSessionHasErrors('payment_status');

    expect($order->fresh()->payment_status)->toBe(Order::PAYMENT_STATUS_UNPAID);
});

test('a customer cannot change another customers payment status', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $order = Order::factory()->create([
        'customer_id' => $owner->id,
        'status' => Order::STATUS_PENDING,
        'payment_status' => Order::PAYMENT_STATUS_UNPAID,
    ]);

    $this->actingAs($other)
        ->put(route('orders.payment', $order), [
            'payment_status' => Order::PAYMENT_STATUS_PAID,
        ])
        ->assertForbidden();

    expect($order->fresh()->payment_status)->toBe(Order::PAYMENT_STATUS_UNPAID);
});

test('a customer can update their order notes', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->put(route('orders.notes', $order), ['notes' => 'Please bubble wrap.'])
        ->assertRedirect();

    expect($order->fresh()->notes)->toBe('Please bubble wrap.');
});

test('a customer can download their order invoice', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->withItems(1)->create([
        'customer_id' => $customer->id,
        'down_payment' => '20.00',
    ]);

    $response = $this->actingAs($customer)
        ->get(route('orders.invoice', $order))
        ->assertOk();

    expect($response->headers->get('content-type'))
        ->toContain('application/pdf')
        ->and($response->headers->get('content-disposition'))
        ->toContain("invoice-{$order->order_number}.pdf");
});

test('a customer cannot download another customers invoice', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $order = Order::factory()->create(['customer_id' => $owner->id]);

    $this->actingAs($other)
        ->get(route('orders.invoice', $order))
        ->assertForbidden();
});

test('the invoice falls back to the store name when the logo is missing', function () {
    $customer = User::factory()->create();
    ShopSetting::setMany(['store_logo' => 'logos/missing.png']);
    $order = Order::factory()->withItems(1)->create([
        'customer_id' => $customer->id,
    ]);

    $this->actingAs($customer)
        ->get(route('orders.invoice', $order))
        ->assertOk()
        ->assertDownload("invoice-{$order->order_number}.pdf");
});
