<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login when visiting the dashboard', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('an admin sees the analytics dashboard', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('stats')
            ->has('recentOrders')
            ->has('topSellers'));
});

test('the admin dashboard shows live analytics', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $customer = User::factory()->create();

    $product = Product::factory()->create([
        'name' => 'Charizard VMAX',
        'price' => '50.00',
        'status' => Product::STATUS_READY,
        'stock' => 3,
    ]);
    Product::factory()->create([
        'status' => Product::STATUS_READY,
        'stock' => 50,
    ]);

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PENDING,
        'total' => '100.00',
    ]);
    $order->items()->create([
        'product_id' => $product->id,
        'product_name' => 'Charizard VMAX',
        'unit_price' => '50.00',
        'quantity' => 2,
        'subtotal' => '100.00',
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('stats.orders_count', 1)
            ->where('stats.pending_orders', 1)
            ->where('stats.total_revenue', 100)
            ->where('stats.units_in_stock', 53)
            ->where('stats.low_stock_count', 1)
            ->where('recentOrders.0.order_number', $order->order_number)
            ->where('recentOrders.0.customer_name', $customer->name)
            ->where('topSellers.0.product_name', 'Charizard VMAX')
            ->where('topSellers.0.total_sold', 2)
            ->has('lowStock', 1)
            ->where('lowStock.0.name', 'Charizard VMAX')
            ->where('lowStock.0.stock', 3));
});

test('the dashboard sales chart reflects the selected period', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $customer = User::factory()->create();

    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_COMPLETED,
        'total' => '80.00',
        'created_at' => now()->startOfMonth(),
    ]);
    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_CANCELLED,
        'total' => '200.00',
        'created_at' => now()->startOfMonth(),
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('salesByDay', now()->daysInMonth)
            ->where('salesByDay.0.revenue', 80)
            ->where('salesByDay.0.orders', 2));
});

test('the admin dashboard can be filtered by month and year', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $customer = User::factory()->create();

    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PENDING,
        'total' => '100.00',
        'created_at' => now()->startOfMonth(),
    ]);

    $older = now()->subMonths(2);
    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_COMPLETED,
        'total' => '50.00',
        'created_at' => $older,
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard', ['month' => now()->month, 'year' => now()->year]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('stats.orders_count', 1)
            ->where('stats.pending_orders', 1)
            ->where('stats.total_revenue', 100)
            ->has('recentOrders', 1)
            ->where('filters.month', now()->month)
            ->where('filters.year', now()->year));

    $this->actingAs($admin)
        ->get(route('dashboard', ['month' => $older->month, 'year' => $older->year]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('stats.orders_count', 1)
            ->where('stats.pending_orders', 0)
            ->where('stats.total_revenue', 50)
            ->has('recentOrders', 1));
});

test('a customer sees their own dashboard overview', function () {
    $customer = User::factory()->create();
    Order::factory()->count(2)->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customer/dashboard')
            ->where('orderCount', 2)
            ->has('recentOrders', 2));
});
