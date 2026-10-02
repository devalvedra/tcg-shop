<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.index'))
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'NewPass123!',
            'password_confirmation' => 'NewPass123!',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.index'));

    expect(Hash::check('NewPass123!', $user->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.index'))
        ->put(route('user-password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'NewPass123!',
            'password_confirmation' => 'NewPass123!',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect(route('profile.index'));
});

test('a weak password is rejected with a single message', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.index'))
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'weakpass',
            'password_confirmation' => 'weakpass',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.index'));

    expect(session('errors')->get('password'))->toHaveCount(1);
    expect(Hash::check('password', $user->refresh()->password))->toBeTrue();
});
