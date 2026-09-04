<?php

use App\Models\Address;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('admin.customers.index'))->assertRedirect(route('admin.login'));
});

test('customers cannot access the admin panel', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.customers.index'))
        ->assertRedirect(route('dashboard'));
});

test('customer accounts can be listed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    $customers = User::factory()->count(3)->create();

    User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->get(route('admin.customers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/customers/index')
            ->has('customers.data', 3)
            ->where('customers.data.0.name', $customers[0]->name)
            ->where('customers.total', 3));
});

test('customer accounts can be searched by phone', function () {
    $admin = User::factory()->asAdmin()->create();
    User::factory()->create(['name' => 'Avery Chen', 'phone' => '09170000001']);
    User::factory()->create(['name' => 'Jordan Miles', 'phone' => '09170000002']);

    $this->actingAs($admin)
        ->get(route('admin.customers.index', ['search' => '09170000002']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.name', 'Jordan Miles'));
});

test('customer accounts can be sorted by name', function () {
    $admin = User::factory()->asAdmin()->create();
    User::factory()->create(['name' => 'Bravo Collector']);
    User::factory()->create(['name' => 'Alpha Collector']);
    User::factory()->create(['name' => 'Charlie Collector']);

    $this->actingAs($admin)
        ->get(route('admin.customers.index', ['sort' => 'name', 'direction' => 'asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('customers.data.0.name', 'Alpha Collector'));

    $this->actingAs($admin)
        ->get(route('admin.customers.index', ['sort' => 'name', 'direction' => 'desc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('customers.data.0.name', 'Charlie Collector'));
});

test('a customer detail page can be viewed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create(['name' => 'Avery Chen']);
    Address::factory()->create(['user_id' => $customer->id]);

    $this->actingAs($admin)
        ->get(route('admin.customers.show', $customer))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/customers/show')
            ->where('customer.name', 'Avery Chen')
            ->has('addresses', 1)
            ->has('orders', 0));
});

test('a customer account can be created with the default password', function () {
    $admin = User::factory()->asAdmin()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.customers.store'), [
            'name' => 'Avery Chen',
            'phone' => '09171234567',
            'email' => 'avery@example.com',
        ]);

    $customer = User::where('phone', '09171234567')->firstOrFail();

    $response->assertRedirect(route('admin.customers.show', $customer));

    $this->assertDatabaseHas('users', [
        'name' => 'Avery Chen',
        'phone' => '09171234567',
        'email' => 'avery@example.com',
        'role' => User::ROLE_CUSTOMER,
    ]);

    $this->assertTrue(Hash::check(User::DEFAULT_CUSTOMER_PASSWORD, $customer->password));
});

test('customer account validation requires a name and phone', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.customers.store'), [
            'email' => 'not-an-email',
        ])
        ->assertSessionHasErrors(['name', 'phone', 'email']);
});

test('customer phone and email must be unique', function () {
    $admin = User::factory()->asAdmin()->create();
    User::factory()->create(['phone' => '09171234567', 'email' => 'avery@example.com']);

    $this->actingAs($admin)
        ->post(route('admin.customers.store'), [
            'name' => 'Avery Chen',
            'phone' => '09171234567',
            'email' => 'avery@example.com',
        ])
        ->assertSessionHasErrors(['phone', 'email']);
});

test('a customer account can be updated', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create([
        'name' => 'Old Name',
        'phone' => '09170000001',
        'email' => 'old@example.com',
    ]);

    $this->actingAs($admin)
        ->put(route('admin.customers.update', $customer), [
            'name' => 'New Name',
            'phone' => '09170000002',
            'email' => 'new@example.com',
        ])
        ->assertRedirect(route('admin.customers.show', $customer));

    $this->assertDatabaseHas('users', [
        'id' => $customer->id,
        'name' => 'New Name',
        'phone' => '09170000002',
        'email' => 'new@example.com',
        'role' => User::ROLE_CUSTOMER,
    ]);
});

test('a customer account can be deleted', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.customers.destroy', $customer))
        ->assertRedirect(route('admin.customers.index'));

    $this->assertDatabaseMissing('users', ['id' => $customer->id]);
});

test('an admin can view a customers shipping addresses on the edit page', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $address = Address::factory()->default()->create([
        'user_id' => $customer->id,
        'receiver_name' => 'Alex Carter',
        'address' => '123 Card Street',
        'city' => 'Manila',
        'zip' => '1000',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.customers.edit', $customer))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/customers/edit')
            ->where('customer.id', $customer->id)
            ->has('addresses', 1)
            ->where('addresses.0.id', $address->id)
            ->where('addresses.0.receiver_name', 'Alex Carter')
            ->where('addresses.0.is_default', true));
});
