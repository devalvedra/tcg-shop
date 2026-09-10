<?php

use App\Models\ShopSetting;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('register screen can be rendered', function () {
    $this->get(route('register'))->assertOk();
});

test('customers can register and are redirected to the storefront', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Avery Chen',
        'phone' => '09171234567',
        'email' => 'avery@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('home'));

    $this->assertDatabaseHas('users', [
        'name' => 'Avery Chen',
        'phone' => '09171234567',
        'email' => 'avery@example.com',
        'role' => User::ROLE_CUSTOMER,
    ]);

    $this->assertAuthenticated();
});

test('customers can register without an email', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Avery Chen',
        'phone' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('home'));
    $this->assertAuthenticated();
});

test('new customers wait for verification when it is required', function () {
    ShopSetting::setMany(['customer_verification' => '1']);

    $response = $this->post(route('register.store'), [
        'name' => 'Avery Chen',
        'phone' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('register.pending'));

    $this->assertGuest();
    $this->assertDatabaseHas('users', [
        'name' => 'Avery Chen',
        'phone' => '09171234567',
        'status' => User::STATUS_PENDING,
    ]);

    $this->get(route('register.pending'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/pending-verification'));
});

test('new customers are verified when verification is disabled', function () {
    ShopSetting::setMany(['customer_verification' => '0']);

    $response = $this->post(route('register.store'), [
        'name' => 'Avery Chen',
        'phone' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('home'));

    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', [
        'name' => 'Avery Chen',
        'phone' => '09171234567',
        'status' => User::STATUS_VERIFIED,
    ]);
});

test('registration requires a name, phone, and password', function () {
    $this->post(route('register.store'), [
        'email' => 'not-an-email',
    ])->assertSessionHasErrors(['name', 'phone', 'password']);
});

test('registration requires a confirmed password', function () {
    $this->post(route('register.store'), [
        'name' => 'Avery Chen',
        'phone' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'not-matching',
    ])->assertSessionHasErrors('password');
});

test('registration phone and email must be unique', function () {
    User::factory()->create(['phone' => '09171234567', 'email' => 'avery@example.com']);

    $this->post(route('register.store'), [
        'name' => 'Avery Chen',
        'phone' => '09171234567',
        'email' => 'avery@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors(['phone', 'email']);
});
