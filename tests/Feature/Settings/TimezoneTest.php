<?php

use App\Models\Order;
use App\Models\User;
use App\Support\UserTimezone;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('users default to the Asia/Jakarta time zone', function () {
    $user = User::create([
        'name' => 'Jakarta Shopper',
        'phone' => '+6281234567890',
        'email' => 'shopper@example.com',
        'password' => 'password',
    ]);

    expect($user->refresh()->timezone)->toBe('Asia/Jakarta');
});

test('profile updates reject an unknown time zone', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('profile.index'))
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
            'timezone' => 'Mars/Olympus',
        ])
        ->assertSessionHasErrors('timezone');

    expect($user->refresh()->timezone)->toBe('UTC');
});

test('the profile page shares the user time zone with the frontend', function () {
    $user = User::factory()->create(['timezone' => 'Asia/Jakarta']);

    $this->actingAs($user)
        ->get(route('profile.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.timezone', 'Asia/Jakarta'));
});

test('admin settings reject an unknown time zone', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            'store_name' => 'Card Haven',
            'shipping_fee' => '5.00',
            'free_shipping_threshold' => '100.00',
            'locale' => 'en',
            'currency' => 'usd',
            'timezone' => 'Mars/Olympus',
        ])
        ->assertSessionHasErrors('timezone');

    expect($admin->refresh()->timezone)->toBe('UTC');
});

test('user time zones resolve to themselves when valid', function () {
    $user = User::factory()->create(['timezone' => 'Asia/Jakarta']);

    expect(UserTimezone::resolve($user))->toBe('Asia/Jakarta');
});

test('missing or unknown user time zones fall back to Asia/Jakarta', function () {
    expect(UserTimezone::resolve(null))->toBe('Asia/Jakarta');

    $user = User::factory()->make(['timezone' => 'Mars/Olympus']);

    expect(UserTimezone::resolve($user))->toBe('Asia/Jakarta');
});

test('the order export shows timestamps in the admin time zone', function () {
    $admin = User::factory()->asAdmin()->create(['timezone' => 'Asia/Jakarta']);
    Order::factory()->withItems(1)->create([
        'created_at' => Carbon::parse('2026-10-10 18:00:00', 'UTC'),
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.orders.export'))
        ->assertOk();

    expect($response->streamedContent())->toContain('2026-10-11 01:00:00');
});

test('the order export keeps utc timestamps for utc users', function () {
    $admin = User::factory()->asAdmin()->create(['timezone' => 'UTC']);
    Order::factory()->withItems(1)->create([
        'created_at' => Carbon::parse('2026-10-10 18:00:00', 'UTC'),
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.orders.export'))
        ->assertOk();

    expect($response->streamedContent())->toContain('2026-10-10 18:00:00');
});

test('the packing report shows order dates in the admin time zone', function () {
    $admin = User::factory()->asAdmin()->create(['timezone' => 'Asia/Jakarta']);
    $customer = User::factory()->create();
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'status' => Order::STATUS_PROCESSING,
        'created_at' => Carbon::parse('2026-10-10 18:00:00', 'UTC'),
    ]);
    $order->items()->create([
        'product_name' => 'Pikachu',
        'quantity' => 1,
        'unit_price' => '10',
        'subtotal' => '10',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.reports.packing'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('rows.0.order_date', '11/10/2026'));
});

test('the order export falls back to Asia/Jakarta for unknown time zones', function () {
    $admin = User::factory()->asAdmin()->create(['timezone' => 'Mars/Olympus']);
    Order::factory()->withItems(1)->create([
        'created_at' => Carbon::parse('2026-10-10 18:00:00', 'UTC'),
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.orders.export'))
        ->assertOk();

    expect($response->streamedContent())->toContain('2026-10-11 01:00:00');
});
