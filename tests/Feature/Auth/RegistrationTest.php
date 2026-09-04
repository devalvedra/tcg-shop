<?php

use App\Models\User;

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
