<?php

use App\Models\Address;
use App\Models\User;

test('guests are redirected to login when managing addresses', function () {
    $this->post(route('addresses.store'))->assertRedirect(route('login'));
    $this->patch(route('addresses.set-default', 1))->assertRedirect(route('login'));
    $this->delete(route('addresses.destroy', 1))->assertRedirect(route('login'));
});

test('a customer can add their first address and it becomes the default', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('profile.index'))
        ->post(route('addresses.store'), [
            'receiver_name' => 'Ash Ketchum',
            'address' => '123 Card Lane',
            'city' => 'Makati',
            'zip' => '1234',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.index'));

    $this->assertDatabaseHas('addresses', [
        'user_id' => $user->id,
        'receiver_name' => 'Ash Ketchum',
        'address' => '123 Card Lane',
        'city' => 'Makati',
        'zip' => '1234',
        'is_default' => true,
    ]);
});

test('a customer can add an address and mark it as default', function () {
    $user = User::factory()->create();
    Address::factory()->default()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('addresses.store'), [
            'receiver_name' => 'Misty',
            'address' => '456 Water Way',
            'city' => 'Pasig',
            'is_default' => true,
        ])
        ->assertSessionHasNoErrors();

    $newDefault = Address::where('user_id', $user->id)
        ->where('receiver_name', 'Misty')
        ->firstOrFail();

    $this->assertTrue((bool) $newDefault->is_default);
    $this->assertSame(1, Address::where('user_id', $user->id)->where('is_default', true)->count());
});

test('a customer can update an address', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->from(route('profile.index'))
        ->put(route('addresses.update', $address), [
            'receiver_name' => 'Brock',
            'address' => '789 Rock Rd',
            'city' => 'Quezon City',
            'zip' => '1100',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.index'));

    $this->assertDatabaseHas('addresses', [
        'id' => $address->id,
        'receiver_name' => 'Brock',
        'address' => '789 Rock Rd',
        'city' => 'Quezon City',
        'zip' => '1100',
    ]);
});

test('a customer can set an address as their default', function () {
    $user = User::factory()->create();
    $first = Address::factory()->default()->create(['user_id' => $user->id]);
    $second = Address::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->patch(route('addresses.set-default', $second))
        ->assertSessionHasNoErrors();

    $this->assertTrue((bool) $second->fresh()->is_default);
    $this->assertFalse((bool) $first->fresh()->is_default);
    $this->assertSame(1, Address::where('user_id', $user->id)->where('is_default', true)->count());
});

test('a customer can update the default address and keep it as default', function () {
    $user = User::factory()->create();
    $address = Address::factory()->default()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->from(route('profile.index'))
        ->put(route('addresses.update', $address), [
            'receiver_name' => 'Brock',
            'address' => '789 Rock Rd',
            'city' => 'Quezon City',
            'zip' => '1100',
            'is_default' => true,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.index'));

    $this->assertTrue((bool) $address->fresh()->is_default);
    $this->assertSame(1, Address::where('user_id', $user->id)->where('is_default', true)->count());
});

test('a customer can delete an address', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->from(route('profile.index'))
        ->delete(route('addresses.destroy', $address))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.index'));

    $this->assertDatabaseMissing('addresses', ['id' => $address->id]);
});

test('deleting the default address promotes the newest remaining address', function () {
    $user = User::factory()->create();
    $default = Address::factory()->default()->create(['user_id' => $user->id]);
    $newest = Address::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('addresses.destroy', $default))
        ->assertSessionHasNoErrors();

    $this->assertTrue((bool) $newest->fresh()->is_default);
    $this->assertSame(1, Address::where('user_id', $user->id)->where('is_default', true)->count());
});

test('a customer cannot update another customers address', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $other->id]);

    $this->actingAs($user)
        ->put(route('addresses.update', $address), [
            'receiver_name' => 'Team Rocket',
            'address' => '111 Sneaky St',
            'city' => 'Manila',
        ])
        ->assertForbidden();

    $this->assertDatabaseHas('addresses', ['id' => $address->id, 'receiver_name' => $address->receiver_name]);
});

test('a customer cannot set another customers address as default', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $other->id]);

    $this->actingAs($user)
        ->patch(route('addresses.set-default', $address))
        ->assertForbidden();

    $this->assertFalse((bool) $address->fresh()->is_default);
});

test('a customer cannot delete another customers address', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $other->id]);

    $this->actingAs($user)
        ->delete(route('addresses.destroy', $address))
        ->assertForbidden();

    $this->assertDatabaseHas('addresses', ['id' => $address->id]);
});
