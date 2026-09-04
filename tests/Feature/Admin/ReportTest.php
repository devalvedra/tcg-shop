<?php

use App\Models\Order;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from the reports', function () {
    $this->get(route('admin.reports.selling-products'))->assertRedirect(route('admin.login'));
});

test('customers cannot access the reports', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.reports.selling-products'))
        ->assertRedirect(route('admin.dashboard'));
});

test('the selling products report shows the units sold per product', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();

    foreach ([2, 3] as $quantity) {
        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'status' => Order::STATUS_COMPLETED,
            'total' => (string) ($quantity * 100),
        ]);

        $order->items()->create([
            'product_name' => 'Charizard VMAX',
            'unit_price' => '100.00',
            'quantity' => $quantity,
            'subtotal' => (string) ($quantity * 100),
        ]);
    }

    $this->actingAs($admin)
        ->get(route('admin.reports.selling-products'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports/selling-products')
            ->has('rows', 1)
            ->where('rows.0.product_name', 'Charizard VMAX')
            ->where('rows.0.stock', 0)
            ->where('rows.0.units_sold', 5)
            ->where('rows.0.total_revenue', 500));
});

test('the customer order report lists one row per product line', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create(['name' => 'Ash Ketchum']);

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_COMPLETED,
    ]);

    $order->items()->create(['product_name' => 'Charizard EX', 'quantity' => 2, 'unit_price' => '50', 'subtotal' => '100']);
    $order->items()->create(['product_name' => 'Booster Box', 'quantity' => 3, 'unit_price' => '30', 'subtotal' => '90']);

    $this->actingAs($admin)
        ->get(route('admin.reports.customer-orders', ['customer' => 'ash']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports/customer-orders')
            ->has('rows', 2)
            ->where('rows.0.customer_name', 'Ash Ketchum')
            ->where('rows.0.order_number', $order->order_number)
            ->where('rows.0.product_name', 'Charizard EX')
            ->where('rows.0.quantity', 2)
            ->where('rows.1.product_name', 'Booster Box')
            ->where('rows.1.quantity', 3));
});

test('the total sales report includes order rows plus date and month subtotals', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();

    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_COMPLETED,
        'total' => '80.00',
        'created_at' => now()->startOfDay(),
    ]);
    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PENDING,
        'total' => '20.00',
        'created_at' => now()->startOfDay(),
    ]);
    Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_CANCELLED,
        'total' => '999.00',
        'created_at' => now()->startOfDay(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.reports.total-sales'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports/total-sales')
            ->has('rows', 5)
            ->where('rows.0.type', 'order')
            ->where('rows.1.type', 'order')
            ->where('rows.2.type', 'date_total')
            ->where('rows.2.total', 100)
            ->where('rows.3.type', 'month_total')
            ->where('rows.3.total', 100)
            ->where('rows.4.type', 'grand_total')
            ->where('rows.4.total', 100));
});

test('a report can be exported as an excel file', function () {
    $admin = User::factory()->asAdmin()->create();

    $response = $this->actingAs($admin)
        ->get(route('admin.reports.selling-products.export'))
        ->assertOk();

    expect($response->headers->get('content-type'))->toContain('spreadsheetml');
    expect($response->headers->get('content-disposition'))->toContain('.xlsx');
});
