<?php

use App\Models\Order;
use App\Models\Product;
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

test('the selling products report can be filtered by product type', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();

    $ready = Product::factory()->create(['status' => Product::STATUS_READY]);
    $preOrder = Product::factory()->preOrder()->create();

    foreach ([$ready, $preOrder] as $product) {
        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'status' => Order::STATUS_COMPLETED,
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => '10.00',
            'quantity' => 1,
            'subtotal' => '10.00',
        ]);
    }

    $this->actingAs($admin)
        ->get(route('admin.reports.selling-products', ['type' => Product::STATUS_READY]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('rows', 1)
            ->where('rows.0.product_name', $ready->name)
            ->where('rows.0.product_status', Product::STATUS_READY)
            ->where('filters.type', Product::STATUS_READY));
});

test('the packing report lists product lines from orders that still need packing', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create(['name' => 'Ash Ketchum']);

    $processing = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PROCESSING,
        'receiver_name' => 'Ash Ketchum',
        'shipping_address' => '123 Card Lane',
        'shipping_city' => 'Makati',
    ]);
    $processing->items()->create([
        'product_name' => 'Charizard EX',
        'quantity' => 2,
        'unit_price' => '50',
        'subtotal' => '100',
    ]);

    foreach ([Order::STATUS_PENDING, Order::STATUS_COMPLETED, Order::STATUS_CANCELLED] as $status) {
        $excluded = Order::factory()->create([
            'customer_id' => $customer->id,
            'status' => $status,
        ]);
        $excluded->items()->create([
            'product_name' => 'Excluded Card',
            'quantity' => 1,
            'unit_price' => '10',
            'subtotal' => '10',
        ]);
    }

    $this->actingAs($admin)
        ->get(route('admin.reports.packing'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports/packing')
            ->has('rows', 1)
            ->where('rows.0.product_name', 'Charizard EX')
            ->where('rows.0.order_date', now()->format('d/m/Y'))
            ->where('rows.0.user_name', 'Ash Ketchum')
            ->where('rows.0.quantity', 2)
            ->where('rows.0.address', 'Ash Ketchum, 123 Card Lane, Makati'));

    $this->actingAs($admin)
        ->get(route('admin.reports.packing', ['search' => 'charizard']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('rows', 1));

    $this->actingAs($admin)
        ->get(route('admin.reports.packing', ['search' => 'no-such-card']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('rows', 0));

    $response = $this->actingAs($admin)
        ->get(route('admin.reports.packing.export'))
        ->assertOk();

    expect($response->headers->get('content-type'))->toContain('spreadsheetml');
    expect($response->headers->get('content-disposition'))->toContain('.xlsx');
});

test('the packing report search follows the selected grouping', function () {
    $admin = User::factory()->asAdmin()->create();
    $ash = User::factory()->create(['name' => 'Ash Ketchum']);
    $misty = User::factory()->create(['name' => 'Misty Waterflower']);

    $ashOrder = Order::factory()->create([
        'customer_id' => $ash->id,
        'status' => Order::STATUS_PROCESSING,
    ]);
    $ashOrder->items()->create([
        'product_name' => 'Charizard EX',
        'quantity' => 2,
        'unit_price' => '50',
        'subtotal' => '100',
    ]);

    $mistyOrder = Order::factory()->create([
        'customer_id' => $misty->id,
        'status' => Order::STATUS_PROCESSING,
    ]);
    $mistyOrder->items()->create([
        'product_name' => 'Starmie V',
        'quantity' => 1,
        'unit_price' => '10',
        'subtotal' => '10',
    ]);

    // Default grouping is by product, so the search matches product names.
    $this->actingAs($admin)
        ->get(route('admin.reports.packing', ['search' => 'charizard']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('rows', 1)
            ->where('rows.0.product_name', 'Charizard EX')
            ->where('filters.group', 'product')
            ->where('filters.search', 'charizard'));

    // Grouping by customer searches customer names instead.
    $this->actingAs($admin)
        ->get(route('admin.reports.packing', ['group' => 'customer', 'search' => 'misty']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('rows', 1)
            ->where('rows.0.user_name', 'Misty Waterflower')
            ->where('filters.group', 'customer'));

    // Product names no longer match while grouping by customer.
    $this->actingAs($admin)
        ->get(route('admin.reports.packing', ['group' => 'customer', 'search' => 'charizard']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('rows', 0));

    // Unknown grouping values fall back to the product grouping.
    $this->actingAs($admin)
        ->get(route('admin.reports.packing', ['group' => 'unknown']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.group', 'product'));
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

test('the selling product history returns the order lines for a product', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create(['name' => 'Ash Ketchum']);

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_COMPLETED,
        'created_at' => '2026-01-15 10:00:00',
    ]);
    $order->items()->create([
        'product_name' => 'Charizard EX',
        'quantity' => 2,
        'unit_price' => '50',
        'subtotal' => '100',
    ]);

    $cancelled = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_CANCELLED,
    ]);
    $cancelled->items()->create([
        'product_name' => 'Charizard EX',
        'quantity' => 9,
        'unit_price' => '50',
        'subtotal' => '450',
    ]);

    $other = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_COMPLETED,
    ]);
    $other->items()->create([
        'product_name' => 'Booster Box',
        'quantity' => 1,
        'unit_price' => '30',
        'subtotal' => '30',
    ]);

    $this->actingAs($admin)
        ->getJson(route('admin.reports.selling-products.history', ['product' => 'Charizard EX']))
        ->assertOk()
        ->assertJsonCount(1, 'orders')
        ->assertJsonPath('orders.0.order_id', $order->id)
        ->assertJsonPath('orders.0.order_number', $order->order_number)
        ->assertJsonPath('orders.0.customer_name', 'Ash Ketchum')
        ->assertJsonPath('orders.0.date', '15/01/2026')
        ->assertJsonPath('orders.0.quantity', 2);
});

test('the selling product history respects the report status filter', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();

    $processing = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PROCESSING,
    ]);
    $processing->items()->create([
        'product_name' => 'Charizard EX',
        'quantity' => 1,
        'unit_price' => '50',
        'subtotal' => '50',
    ]);

    $this->actingAs($admin)
        ->getJson(route('admin.reports.selling-products.history', [
            'product' => 'Charizard EX',
            'statuses' => [Order::STATUS_COMPLETED],
        ]))
        ->assertOk()
        ->assertJsonCount(0, 'orders');
});

test('the selling product history is empty without a product name', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->getJson(route('admin.reports.selling-products.history'))
        ->assertOk()
        ->assertJsonCount(0, 'orders');
});

test('guests cannot view the selling product history', function () {
    $this->getJson(route('admin.reports.selling-products.history', ['product' => 'Charizard EX']))
        ->assertUnauthorized();
});

test('a report can be exported as an excel file', function () {
    $admin = User::factory()->asAdmin()->create();

    $response = $this->actingAs($admin)
        ->get(route('admin.reports.selling-products.export'))
        ->assertOk();

    expect($response->headers->get('content-type'))->toContain('spreadsheetml');
    expect($response->headers->get('content-disposition'))->toContain('.xlsx');
});
