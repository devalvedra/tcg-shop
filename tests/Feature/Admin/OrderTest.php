<?php

use App\Models\Order;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('admin.orders.index'))->assertRedirect(route('admin.login'));
});

test('customers cannot access the admin order pages', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->get(route('admin.orders.index'))
        ->assertRedirect(route('dashboard'));

    $this->actingAs($customer)
        ->get(route('admin.orders.show', $order))
        ->assertRedirect(route('dashboard'));
});

test('orders can be listed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    Order::factory()->count(3)->withItems(1)->create();

    $this->actingAs($admin)
        ->get(route('admin.orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/index')
            ->has('orders.data', 3)
            ->where('orders.total', 3));
});

test('orders receive a unique random order number', function () {
    $admin = User::factory()->asAdmin()->create();
    $orders = Order::factory()->count(20)->create();

    foreach ($orders as $order) {
        $this->assertMatchesRegularExpression('/^ORD-[A-Z0-9]{12}$/', $order->order_number);
    }

    $this->assertSame(20, $orders->pluck('order_number')->unique()->count());
});

test('the order list includes the down payment and payment status', function () {
    $admin = User::factory()->asAdmin()->create();
    Order::factory()->create([
        'down_payment' => '50.00',
        'payment_status' => Order::PAYMENT_STATUS_DP,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/index')
            ->has('orders.data', 1)
            ->where('orders.data.0.down_payment', '50.00')
            ->where('orders.data.0.payment_status', Order::PAYMENT_STATUS_DP));
});

test('orders can be filtered by order number and status', function () {
    $admin = User::factory()->asAdmin()->create();
    $pending = Order::factory()->create(['status' => Order::STATUS_PENDING]);
    $completed = Order::factory()->create(['status' => Order::STATUS_COMPLETED]);

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['search' => $pending->order_number]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $pending->id));

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['status' => Order::STATUS_COMPLETED]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $completed->id));
});

test('orders can be filtered by payment status', function () {
    $admin = User::factory()->asAdmin()->create();
    Order::factory()->create(['payment_status' => Order::PAYMENT_STATUS_UNPAID]);
    $paid = Order::factory()->create(['payment_status' => Order::PAYMENT_STATUS_PAID]);

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['payment_status' => Order::PAYMENT_STATUS_PAID]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $paid->id));
});

test('orders can be sorted by customer name', function () {
    $admin = User::factory()->asAdmin()->create();
    $bravo = User::factory()->create(['name' => 'Bravo Buyer']);
    $alpha = User::factory()->create(['name' => 'Alpha Buyer']);
    Order::factory()->create(['customer_id' => $bravo->id]);
    Order::factory()->create(['customer_id' => $alpha->id]);

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['sort' => 'customer', 'direction' => 'asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('orders.data.0.customer.name', 'Alpha Buyer'));

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['sort' => 'customer', 'direction' => 'desc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('orders.data.0.customer.name', 'Bravo Buyer'));
});

test('orders can be sorted by status', function () {
    $admin = User::factory()->asAdmin()->create();
    Order::factory()->create(['status' => Order::STATUS_PENDING]);
    Order::factory()->create(['status' => Order::STATUS_COMPLETED]);

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['sort' => 'status', 'direction' => 'asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('orders.data.0.status', Order::STATUS_COMPLETED));

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['sort' => 'status', 'direction' => 'desc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('orders.data.0.status', Order::STATUS_PENDING));
});

test('orders can be sorted by order date', function () {
    $admin = User::factory()->asAdmin()->create();
    $old = Order::factory()->create(['created_at' => now()->subDays(5)]);
    $recent = Order::factory()->create(['created_at' => now()->subDay()]);

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['sort' => 'date', 'direction' => 'asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('orders.data.0.id', $old->id));

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['sort' => 'date', 'direction' => 'desc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('orders.data.0.id', $recent->id));
});

test('orders can be searched by customer name', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create(['name' => 'Charizard Collector']);
    $order = Order::factory()->create(['customer_id' => $customer->id]);

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['search' => 'charizard']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $order->id));
});

test('orders can be filtered by customer name', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create(['name' => 'Ash Ketchum']);
    $order = Order::factory()->create(['customer_id' => $customer->id]);
    Order::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['customer' => 'ash']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $order->id));
});

test('orders can be filtered by product name', function () {
    $admin = User::factory()->asAdmin()->create();
    $order = Order::factory()->withItems(1)->create();
    $productName = $order->items->first()->product_name;
    Order::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['product' => $productName]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $order->id));
});

test('orders can be searched by product name using the combined search', function () {
    $admin = User::factory()->asAdmin()->create();
    $order = Order::factory()->withItems(1)->create();
    $productName = $order->items->first()->product_name;
    Order::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['search' => $productName]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $order->id));
});

test('orders can be filtered by date range', function () {
    $admin = User::factory()->asAdmin()->create();
    $oldOrder = Order::factory()->create(['created_at' => now()->subDays(10)]);
    $recentOrder = Order::factory()->create(['created_at' => now()->subDay()]);

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['from' => now()->subDays(5)->format('Y-m-d')]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $recentOrder->id));
});

test('orders can be exported to csv by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create(['name' => 'Misty Waters', 'phone' => '123456789']);
    $order = Order::factory()->withItems(1)->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_COMPLETED,
    ]);
    $productName = $order->items->first()->product_name;
    $total = (float) $order->fresh()->total;

    $response = $this->actingAs($admin)
        ->get(route('admin.orders.export'))
        ->assertOk()
        ->assertDownload();

    expect($response->headers->get('content-disposition'))->toContain('orders-')
        ->and($response->streamedContent())
        ->toContain('Order Number')
        ->toContain($order->order_number)
        ->toContain($customer->name)
        ->toContain($productName)
        ->toContain((string) $total);
});

test('order details can be viewed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    $order = Order::factory()->withItems(2)->create();

    $this->actingAs($admin)
        ->get(route('admin.orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/show')
            ->where('order.id', $order->id)
            ->has('order.items', 2));
});

test('an order status can be updated by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    $order = Order::factory()->create(['status' => Order::STATUS_PENDING]);

    $this->actingAs($admin)
        ->put(route('admin.orders.update', $order), [
            'status' => Order::STATUS_SHIPPED,
            'payment_status' => Order::PAYMENT_STATUS_PAID,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => Order::STATUS_SHIPPED,
        'payment_status' => Order::PAYMENT_STATUS_PAID,
    ]);
});

test('an invalid order status is rejected', function () {
    $admin = User::factory()->asAdmin()->create();
    $order = Order::factory()->create();

    $this->actingAs($admin)
        ->put(route('admin.orders.update', $order), [
            'status' => 'not-a-status',
        ])
        ->assertSessionHasErrors(['status']);

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => $order->status,
    ]);
});
