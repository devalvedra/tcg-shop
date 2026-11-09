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

test('an admin can update a customer verification status', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->pendingVerification()->create();

    $this->actingAs($admin)
        ->patch(route('admin.customers.status', $customer), ['status' => User::STATUS_VERIFIED])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertSame(User::STATUS_VERIFIED, $customer->fresh()->status);

    $this->actingAs($admin)
        ->patch(route('admin.customers.status', $customer), ['status' => User::STATUS_PENDING])
        ->assertRedirect();

    $this->assertSame(User::STATUS_PENDING, $customer->fresh()->status);
});

test('an admin can change a customer password', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();

    $this->actingAs($admin)
        ->from(route('admin.customers.edit', $customer))
        ->patch(route('admin.customers.password', $customer), [
            'password' => 'N3w-Secret!',
            'password_confirmation' => 'N3w-Secret!',
        ])
        ->assertRedirect(route('admin.customers.edit', $customer))
        ->assertSessionHasNoErrors();

    $this->assertTrue(Hash::check('N3w-Secret!', $customer->fresh()->password));
});

test('a new customer password must be confirmed', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $originalPassword = $customer->password;

    $this->actingAs($admin)
        ->patch(route('admin.customers.password', $customer), [
            'password' => 'N3w-Secret!',
            'password_confirmation' => 'N3w-Secret!typo',
        ])
        ->assertSessionHasErrors('password');

    $this->assertSame($originalPassword, $customer->fresh()->password);
});

test('a customer password must be at least four characters', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $originalPassword = $customer->password;

    $this->actingAs($admin)
        ->patch(route('admin.customers.password', $customer), [
            'password' => 'abc',
            'password_confirmation' => 'abc',
        ])
        ->assertSessionHasErrors('password');

    $this->assertSame($originalPassword, $customer->fresh()->password);
});

test('a simple four character password can be set for a customer', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();

    $this->actingAs($admin)
        ->patch(route('admin.customers.password', $customer), [
            'password' => 'abcd',
            'password_confirmation' => 'abcd',
        ])
        ->assertSessionHasNoErrors();

    $this->assertTrue(Hash::check('abcd', $customer->fresh()->password));
});

test('the customer password route cannot be used on an admin account', function () {
    $admin = User::factory()->asAdmin()->create();
    $otherAdmin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->patch(route('admin.customers.password', $otherAdmin), [
            'password' => 'N3w-Secret!',
            'password_confirmation' => 'N3w-Secret!',
        ])
        ->assertNotFound();
});

test('guests cannot change a customer password', function () {
    $customer = User::factory()->create();

    $this->patch(route('admin.customers.password', $customer), [
        'password' => 'N3w-Secret!',
        'password_confirmation' => 'N3w-Secret!',
    ])->assertRedirect(route('admin.login'));
});

test('changing a customer password logs them out of other devices', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $passwordBeforeReset = $customer->password;

    $this->actingAs($admin)
        ->patch(route('admin.customers.password', $customer), [
            'password' => 'N3w-Secret!',
            'password_confirmation' => 'N3w-Secret!',
        ])
        ->assertRedirect();

    // A device that signed in before the reset still carries the old hash.
    $this->actingAs($customer->fresh())
        ->withSession(['password_hash_web' => $passwordBeforeReset])
        ->get(route('profile.index'))
        ->assertRedirect(route('login'));

    // A session opened after the reset keeps working.
    $this->actingAs($customer->fresh())
        ->get(route('profile.index'))
        ->assertOk();
});

test('customer accounts created by an admin are verified', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.customers.store'), [
            'name' => 'Avery Chen',
            'phone' => '09171234567',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'phone' => '09171234567',
        'status' => User::STATUS_VERIFIED,
    ]);
});

test('an admin can add a shipping address to a customer', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();

    $this->actingAs($admin)
        ->from(route('admin.customers.edit', $customer))
        ->post(route('admin.customers.addresses.store', $customer), [
            'receiver_name' => 'Alex Carter',
            'address' => '123 Card Street',
            'city' => 'Manila',
            'province' => 'Metro Manila',
            'zip' => '1000',
        ])
        ->assertRedirect(route('admin.customers.edit', $customer))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('addresses', [
        'user_id' => $customer->id,
        'receiver_name' => 'Alex Carter',
        'address' => '123 Card Street',
        'city' => 'Manila',
    ]);
});

test('the first address added becomes the default', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.customers.addresses.store', $customer), [
            'receiver_name' => 'Alex Carter',
            'address' => '123 Card Street',
            'city' => 'Manila',
        ])
        ->assertSessionHasNoErrors();

    expect($customer->addresses()->first()?->is_default)->toBeTrue();
});

test('an admin can mark any of a customer addresses as the default', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $oldDefault = Address::factory()->default()->create(['user_id' => $customer->id]);
    $newDefault = Address::factory()->create(['user_id' => $customer->id]);

    $this->actingAs($admin)
        ->patch(route('admin.customers.addresses.set-default', [$customer, $newDefault]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertTrue($newDefault->fresh()->is_default);
    $this->assertFalse($oldDefault->fresh()->is_default);
});

test('an admin can delete a customer address', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $customer->id]);

    $this->actingAs($admin)
        ->delete(route('admin.customers.addresses.destroy', [$customer, $address]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseMissing('addresses', ['id' => $address->id]);
});

test('deleting the default address promotes the newest remaining address', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $default = Address::factory()->default()->create(['user_id' => $customer->id]);
    $remaining = Address::factory()->create(['user_id' => $customer->id]);

    $this->actingAs($admin)
        ->delete(route('admin.customers.addresses.destroy', [$customer, $default]))
        ->assertRedirect();

    $this->assertDatabaseMissing('addresses', ['id' => $default->id]);
    $this->assertTrue($remaining->fresh()->is_default);
});

test('address routes refuse to touch another customer address', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $other = User::factory()->create();
    $foreignAddress = Address::factory()->create(['user_id' => $other->id]);

    $this->actingAs($admin)
        ->patch(route('admin.customers.addresses.set-default', [$customer, $foreignAddress]))
        ->assertNotFound();

    $this->actingAs($admin)
        ->delete(route('admin.customers.addresses.destroy', [$customer, $foreignAddress]))
        ->assertNotFound();

    $this->assertDatabaseHas('addresses', ['id' => $foreignAddress->id]);
});

test('address routes refuse to target a non customer account', function () {
    $admin = User::factory()->asAdmin()->create();
    $otherAdmin = User::factory()->asAdmin()->create();
    $address = Address::factory()->create(['user_id' => $otherAdmin->id]);

    $this->actingAs($admin)
        ->post(route('admin.customers.addresses.store', $otherAdmin), [
            'receiver_name' => 'Alex Carter',
            'address' => '123 Card Street',
            'city' => 'Manila',
        ])
        ->assertNotFound();

    $this->actingAs($admin)
        ->patch(route('admin.customers.addresses.set-default', [$otherAdmin, $address]))
        ->assertNotFound();

    $this->actingAs($admin)
        ->delete(route('admin.customers.addresses.destroy', [$otherAdmin, $address]))
        ->assertNotFound();
});

test('adding a customer address validates the required fields', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.customers.addresses.store', $customer), [
            'city' => '',
        ])
        ->assertSessionHasErrors(['receiver_name', 'address', 'city']);
});

test('an admin can edit a customer address', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $customer->id]);

    $this->actingAs($admin)
        ->from(route('admin.customers.edit', $customer))
        ->put(route('admin.customers.addresses.update', [$customer, $address]), [
            'receiver_name' => 'Alex Carter',
            'address' => '456 Updated Street',
            'city' => 'Manila',
            'province' => 'Metro Manila',
            'district' => 'Quiapo',
            'subdistrict' => 'Barangay 5',
            'zip' => '1001',
            'is_default' => $address->is_default,
        ])
        ->assertRedirect(route('admin.customers.edit', $customer))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('addresses', [
        'id' => $address->id,
        'receiver_name' => 'Alex Carter',
        'address' => '456 Updated Street',
        'district' => 'Quiapo',
        'zip' => '1001',
    ]);
});

test('editing an address can promote it to the default', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $oldDefault = Address::factory()->default()->create(['user_id' => $customer->id]);
    $address = Address::factory()->create(['user_id' => $customer->id]);

    $this->actingAs($admin)
        ->put(route('admin.customers.addresses.update', [$customer, $address]), [
            'receiver_name' => $address->receiver_name,
            'address' => $address->address,
            'city' => $address->city,
            'is_default' => true,
        ])
        ->assertSessionHasNoErrors();

    $this->assertTrue($address->fresh()->is_default);
    $this->assertFalse($oldDefault->fresh()->is_default);
});

test('editing an address cannot leave the customer without a default', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $address = Address::factory()->default()->create(['user_id' => $customer->id]);

    $this->actingAs($admin)
        ->put(route('admin.customers.addresses.update', [$customer, $address]), [
            'receiver_name' => $address->receiver_name,
            'address' => $address->address,
            'city' => $address->city,
            'is_default' => false,
        ])
        ->assertSessionHasNoErrors();

    $this->assertTrue($address->fresh()->is_default);
});

test('editing another customer address is not allowed', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $other = User::factory()->create();
    $foreignAddress = Address::factory()->create(['user_id' => $other->id]);

    $this->actingAs($admin)
        ->put(route('admin.customers.addresses.update', [$customer, $foreignAddress]), [
            'receiver_name' => 'Alex Carter',
            'address' => '123 Card Street',
            'city' => 'Manila',
        ])
        ->assertNotFound();

    $this->assertDatabaseMissing('addresses', [
        'id' => $foreignAddress->id,
        'address' => '123 Card Street',
    ]);
});

test('editing a customer address validates the required fields', function () {
    $admin = User::factory()->asAdmin()->create();
    $customer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $customer->id]);

    $this->actingAs($admin)
        ->put(route('admin.customers.addresses.update', [$customer, $address]), [
            'receiver_name' => '',
            'address' => '',
            'city' => '',
        ])
        ->assertSessionHasErrors(['receiver_name', 'address', 'city']);
});

test('guests cannot edit customer addresses', function () {
    $customer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $customer->id]);

    $this->put(route('admin.customers.addresses.update', [$customer, $address]), [
        'receiver_name' => 'Alex Carter',
        'address' => '123 Card Street',
        'city' => 'Manila',
    ])->assertRedirect(route('admin.login'));

    $this->assertDatabaseMissing('addresses', [
        'id' => $address->id,
        'address' => '123 Card Street',
    ]);
});

test('guests cannot manage customer addresses', function () {
    $customer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $customer->id]);

    $this->post(route('admin.customers.addresses.store', $customer), [
        'receiver_name' => 'Alex Carter',
        'address' => '123 Card Street',
        'city' => 'Manila',
    ])->assertRedirect(route('admin.login'));

    $this->patch(route('admin.customers.addresses.set-default', [$customer, $address]))
        ->assertRedirect(route('admin.login'));

    $this->delete(route('admin.customers.addresses.destroy', [$customer, $address]))
        ->assertRedirect(route('admin.login'));

    $this->assertDatabaseHas('addresses', ['id' => $address->id]);
});
