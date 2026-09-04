<?php

use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;

test('admin login screen can be rendered', function () {
    $this->get(route('admin.login'))->assertOk();
});

test('guests are redirected to the admin login screen when visiting admin', function () {
    $this->get(route('admin'))->assertRedirect(route('admin.login'));
});

test('an authenticated admin is redirected to the dashboard when visiting admin', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->get(route('admin'))
        ->assertRedirect(route('admin.dashboard'));
});

test('administrators can log in using the admin login screen', function () {
    $admin = User::factory()->asAdmin()->create();

    $response = $this->post(route('admin.login.store'), [
        'username' => $admin->username,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('admin.dashboard', absolute: false));
    $this->assertAuthenticatedAs($admin);
});

test('customers cannot log in through the admin login', function () {
    $customer = User::factory()->create(['username' => 'customer-account']);

    $this->post(route('admin.login.store'), [
        'username' => $customer->username,
        'password' => 'password',
    ])->assertSessionHasErrors('username');

    $this->assertGuest();
});

test('administrators cannot log in with an invalid password', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->post(route('admin.login.store'), [
        'username' => $admin->username,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('username');

    $this->assertGuest();
});

test('administrators can log out', function () {
    $admin = User::factory()->asAdmin()->create();

    $response = $this->actingAs($admin)->post(route('logout'));

    $response->assertRedirect(route('home'));
    $this->assertGuest();
});

test('admin login is rate limited after too many attempts', function () {
    $admin = User::factory()->asAdmin()->create();

    RateLimiter::increment(md5('admin-login'.implode('|', [$admin->username, '127.0.0.1'])), amount: 5);

    $response = $this->post(route('admin.login.store'), [
        'username' => $admin->username,
        'password' => 'wrong-password',
    ]);

    $response->assertTooManyRequests();
});
