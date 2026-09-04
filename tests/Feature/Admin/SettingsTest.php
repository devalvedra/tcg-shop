<?php

use App\Models\ShopSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('admin.settings.index'))->assertRedirect(route('admin.login'));
});

test('customers cannot access the admin settings page', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.settings.index'))
        ->assertRedirect(route('dashboard'));

    $this->actingAs($customer)
        ->put(route('admin.settings.update'), [
            'store_name' => 'Hacked Shop',
            'shipping_fee' => '1.00',
            'free_shipping_threshold' => '10.00',
        ])
        ->assertRedirect(route('dashboard'));
});

test('an admin can view the settings page', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->get(route('admin.settings.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/settings/index')
            ->where('settings.store_name', 'TCG Shop')
            ->where('settings.whatsapp_number', null)
            ->where('settings.shipping_fee', '5.00')
            ->where('settings.free_shipping_threshold', '100.00')
            ->where('settings.locale', 'en')
            ->where('settings.currency', 'usd'));
});

test('an admin can update the settings', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            'store_name' => 'Card Haven',
            'store_email' => 'hello@cardhaven.test',
            'store_phone' => '+63 900 000 0000',
            'store_address' => '123 Trading St',
            'whatsapp_number' => '+639170000001',
            'shipping_fee' => '7.50',
            'free_shipping_threshold' => '150.00',
            'locale' => 'id',
            'currency' => 'idr',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('settings', [
        'key' => 'store_name',
        'value' => 'Card Haven',
    ]);
    $this->assertDatabaseHas('settings', [
        'key' => 'whatsapp_number',
        'value' => '+639170000001',
    ]);
    $this->assertDatabaseHas('settings', [
        'key' => 'shipping_fee',
        'value' => '7.50',
    ]);
    $this->assertDatabaseHas('settings', [
        'key' => 'locale',
        'value' => 'id',
    ]);
    $this->assertDatabaseHas('settings', [
        'key' => 'currency',
        'value' => 'idr',
    ]);
});

test('settings validation rejects an unsupported locale', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            'store_name' => 'Card Haven',
            'shipping_fee' => '7.50',
            'free_shipping_threshold' => '150.00',
            'locale' => 'fr',
        ])
        ->assertSessionHasErrors('locale');

    $this->assertDatabaseMissing('settings', [
        'key' => 'locale',
        'value' => 'fr',
    ]);
});

test('settings validation rejects an unsupported currency', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            'store_name' => 'Card Haven',
            'shipping_fee' => '7.50',
            'free_shipping_threshold' => '150.00',
            'currency' => 'jpy',
        ])
        ->assertSessionHasErrors('currency');

    $this->assertDatabaseMissing('settings', [
        'key' => 'currency',
        'value' => 'jpy',
    ]);
});

test('the configured locale and translations are shared with the frontend', function () {
    $admin = User::factory()->asAdmin()->create();
    ShopSetting::setMany(['locale' => 'id']);

    $this->actingAs($admin)
        ->get(route('admin.settings.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'id')
            ->where('translations.Settings', 'Pengaturan'));
});

test('the configured currency is shared with the frontend', function () {
    $admin = User::factory()->asAdmin()->create();
    ShopSetting::setMany(['currency' => 'idr']);

    $this->actingAs($admin)
        ->get(route('admin.settings.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('currency', 'idr'));
});

test('the configured store name is shared with the frontend', function () {
    $admin = User::factory()->asAdmin()->create();
    ShopSetting::setMany(['store_name' => 'Card Haven']);

    $this->actingAs($admin)
        ->get(route('admin.settings.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('name', 'Card Haven'));
});

test('an admin can upload a store logo', function () {
    Storage::fake('public');
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            'store_name' => 'Card Haven',
            'shipping_fee' => '5.00',
            'free_shipping_threshold' => '100.00',
            'locale' => 'en',
            'currency' => 'usd',
            'store_logo' => UploadedFile::fake()->image('logo.png'),
        ])
        ->assertRedirect();

    $logo = ShopSetting::get('store_logo');
    $this->assertNotNull($logo);
    $this->assertTrue(Storage::disk('public')->exists($logo));
    $this->assertDatabaseHas('settings', ['key' => 'store_logo', 'value' => $logo]);
});

test('an admin can remove the store logo', function () {
    Storage::fake('public');
    Storage::disk('public')->put('logos/existing.png', 'fake-image-content');
    ShopSetting::setMany(['store_logo' => 'logos/existing.png']);
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            'store_name' => 'Card Haven',
            'shipping_fee' => '5.00',
            'free_shipping_threshold' => '100.00',
            'locale' => 'en',
            'currency' => 'usd',
            'store_logo_remove' => '1',
        ])
        ->assertRedirect();

    $this->assertNull(ShopSetting::get('store_logo'));
    $this->assertFalse(Storage::disk('public')->exists('logos/existing.png'));
});

test('settings validation rejects invalid values', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            'store_name' => '',
            'shipping_fee' => '-5',
        ])
        ->assertSessionHasErrors(['store_name', 'shipping_fee']);
});
