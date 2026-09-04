<?php

use App\Models\PromoCode;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page for promo codes', function () {
    $this->get(route('admin.promo-codes.index'))->assertRedirect(route('admin.login'));
});

test('customers cannot access the admin promo code pages', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.promo-codes.index'))
        ->assertRedirect(route('dashboard'));
});

test('promo codes can be listed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    $promo = PromoCode::factory()->create(['code' => 'SUMMER10']);

    $this->actingAs($admin)
        ->get(route('admin.promo-codes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/promo-codes/index')
            ->has('promoCodes.data', 1)
            ->where('promoCodes.data.0.code', 'SUMMER10'));
});

test('promo codes can be searched', function () {
    $admin = User::factory()->asAdmin()->create();
    PromoCode::factory()->create(['code' => 'SUMMER10', 'name' => 'Summer sale']);
    PromoCode::factory()->create(['code' => 'WELCOME5', 'name' => 'Welcome gift']);

    $this->actingAs($admin)
        ->get(route('admin.promo-codes.index', ['search' => 'summer']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('promoCodes.data', 1)
            ->where('promoCodes.data.0.code', 'SUMMER10'));
});

test('an admin can create a percentage promo code', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.promo-codes.store'), [
            'code' => 'summer 10',
            'name' => 'Summer sale',
            'description' => 'Ten percent off',
            'discount_type' => PromoCode::DISCOUNT_TYPE_PERCENT,
            'discount_value' => '10',
            'min_subtotal' => '20',
            'max_discount' => '25',
        ])
        ->assertRedirect(route('admin.promo-codes.index'));

    $this->assertDatabaseHas('promo_codes', [
        'code' => 'SUMMER10',
        'name' => 'Summer sale',
        'discount_type' => PromoCode::DISCOUNT_TYPE_PERCENT,
        'discount_value' => '10.00',
        'min_subtotal' => '20.00',
        'max_discount' => '25.00',
        'is_active' => true,
    ]);
});

test('an admin can create a fixed promo code', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.promo-codes.store'), [
            'code' => 'SAVE5',
            'name' => 'Five off',
            'discount_type' => PromoCode::DISCOUNT_TYPE_FIXED,
            'discount_value' => '5',
        ])
        ->assertRedirect(route('admin.promo-codes.index'));

    $this->assertDatabaseHas('promo_codes', [
        'code' => 'SAVE5',
        'discount_type' => PromoCode::DISCOUNT_TYPE_FIXED,
        'discount_value' => '5.00',
    ]);
});

test('promo code validation requires valid fields', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.promo-codes.store'), [
            'code' => 'BAD CODE!',
            'name' => '',
            'discount_type' => 'unknown',
            'discount_value' => '0',
        ])
        ->assertSessionHasErrors(['code', 'name', 'discount_type', 'discount_value']);
});

test('promo code must be unique', function () {
    $admin = User::factory()->asAdmin()->create();
    PromoCode::factory()->create(['code' => 'SUMMER10']);

    $this->actingAs($admin)
        ->post(route('admin.promo-codes.store'), [
            'code' => 'SUMMER10',
            'name' => 'Duplicate',
            'discount_type' => PromoCode::DISCOUNT_TYPE_PERCENT,
            'discount_value' => '10',
        ])
        ->assertSessionHasErrors('code');
});

test('an admin can update a promo code', function () {
    $admin = User::factory()->asAdmin()->create();
    $promo = PromoCode::factory()->create(['code' => 'OLD10', 'discount_value' => '10']);

    $this->actingAs($admin)
        ->put(route('admin.promo-codes.update', $promo), [
            'code' => 'NEW15',
            'name' => 'New discount',
            'discount_type' => PromoCode::DISCOUNT_TYPE_PERCENT,
            'discount_value' => '15',
            'is_active' => false,
        ])
        ->assertRedirect(route('admin.promo-codes.index'));

    $this->assertDatabaseHas('promo_codes', [
        'id' => $promo->id,
        'code' => 'NEW15',
        'discount_value' => '15.00',
        'is_active' => false,
    ]);
});

test('an admin can delete a promo code', function () {
    $admin = User::factory()->asAdmin()->create();
    $promo = PromoCode::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.promo-codes.destroy', $promo))
        ->assertRedirect(route('admin.promo-codes.index'));

    $this->assertDatabaseMissing('promo_codes', ['id' => $promo->id]);
});
