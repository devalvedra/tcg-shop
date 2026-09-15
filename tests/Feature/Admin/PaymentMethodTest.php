<?php

use App\Models\PaymentMethod;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page for payment methods', function () {
    $this->get(route('admin.payment-methods.index'))->assertRedirect(route('admin.login'));
});

test('customers cannot access the admin payment method pages', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.payment-methods.index'))
        ->assertRedirect(route('dashboard'));
});

test('payment methods can be listed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    PaymentMethod::factory()->create(['name' => 'Palawan Pay', 'code' => 'palawan']);

    $this->actingAs($admin)
        ->get(route('admin.payment-methods.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/payment-methods/index')
            ->has('paymentMethods.data', 5)
            ->where('paymentMethods.data.4.name', 'Palawan Pay')
            ->where('paymentMethods.data.4.code', 'palawan'));
});

test('payment methods can be searched', function () {
    $admin = User::factory()->asAdmin()->create();
    PaymentMethod::factory()->create(['name' => 'Palawan Pay', 'code' => 'palawan']);
    PaymentMethod::factory()->create(['name' => 'Cebuana', 'code' => 'cebuana']);

    $this->actingAs($admin)
        ->get(route('admin.payment-methods.index', ['search' => 'cebuana']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('paymentMethods.data', 1)
            ->where('paymentMethods.data.0.code', 'cebuana'));
});

test('an admin can create a payment method', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.payment-methods.store'), [
            'name' => 'Palawan Pay',
            'account_name' => 'Juan Dela Cruz',
            'code' => '0917-654-3210',
        ])
        ->assertRedirect(route('admin.payment-methods.index'));

    $this->assertDatabaseHas('payment_methods', [
        'name' => 'Palawan Pay',
        'account_name' => 'Juan Dela Cruz',
        'code' => '0917-654-3210',
        'is_active' => true,
    ]);
});

test('an admin can create an inactive payment method', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.payment-methods.store'), [
            'name' => 'Remittance',
            'code' => 'remittance',
            'is_active' => false,
        ])
        ->assertRedirect(route('admin.payment-methods.index'));

    $this->assertDatabaseHas('payment_methods', [
        'code' => 'remittance',
        'is_active' => false,
    ]);
});

test('payment method validation requires valid fields', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.payment-methods.store'), [
            'name' => '',
            'code' => '',
        ])
        ->assertSessionHasErrors(['name', 'code']);
});

test('payment method code must be unique', function () {
    $admin = User::factory()->asAdmin()->create();
    PaymentMethod::factory()->create(['code' => 'palawan']);

    $this->actingAs($admin)
        ->post(route('admin.payment-methods.store'), [
            'name' => 'Palawan Duplicate',
            'code' => 'palawan',
        ])
        ->assertSessionHasErrors('code');
});

test('an admin can update a payment method', function () {
    $admin = User::factory()->asAdmin()->create();
    $method = PaymentMethod::factory()->create(['name' => 'Old Wallet', 'code' => 'old-wallet']);

    $this->actingAs($admin)
        ->put(route('admin.payment-methods.update', $method), [
            'name' => 'GCash Wallet',
            'account_name' => 'Jane Doe',
            'code' => 'gcash-wallet',
            'is_active' => false,
        ])
        ->assertRedirect(route('admin.payment-methods.index'));

    $this->assertDatabaseHas('payment_methods', [
        'id' => $method->id,
        'name' => 'GCash Wallet',
        'account_name' => 'Jane Doe',
        'is_active' => false,
    ]);
});

test('an admin can delete a payment method', function () {
    $admin = User::factory()->asAdmin()->create();
    $method = PaymentMethod::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.payment-methods.destroy', $method))
        ->assertRedirect(route('admin.payment-methods.index'));

    $this->assertDatabaseMissing('payment_methods', ['id' => $method->id]);
});
