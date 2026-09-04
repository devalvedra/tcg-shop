<?php

use App\Models\Address;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login when visiting the store profile page', function () {
    $this->get(route('profile.index'))->assertRedirect(route('login'));
});

test('a customer can view their storefront profile', function () {
    $user = User::factory()->create([
        'name' => 'Alex Carter',
        'email' => 'alex@example.com',
        'phone' => '09170000001',
    ]);
    $address = Address::factory()->create([
        'user_id' => $user->id,
        'receiver_name' => 'Alex Carter',
        'address' => '123 Card Street',
        'city' => 'Manila',
        'zip' => '1000',
        'is_default' => true,
    ]);

    $this->actingAs($user)
        ->get(route('profile.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('store/profile')
            ->where('auth.user.id', $user->id)
            ->where('auth.user.name', 'Alex Carter')
            ->where('auth.user.email', 'alex@example.com')
            ->has('addresses', 1)
            ->where('addresses.0.id', $address->id));
});
