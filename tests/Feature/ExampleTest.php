<?php

use App\Models\User;

test('the storefront can be viewed by guests', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
});

test('the storefront can be viewed by authenticated users', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('home'));

    $response->assertOk();
});
