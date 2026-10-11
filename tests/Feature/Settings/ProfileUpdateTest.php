<?php

use App\Models\User;

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.index'))
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'timezone' => 'Asia/Jakarta',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.index'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->timezone)->toBe('Asia/Jakarta');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.index'))
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
            'timezone' => $user->timezone ?? 'UTC',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.index'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});
