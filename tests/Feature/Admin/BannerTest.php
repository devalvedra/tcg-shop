<?php

use App\Models\Banner;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('admin.banners.index'))->assertRedirect(route('admin.login'));
});

test('customers cannot access the admin banner pages', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.banners.index'))
        ->assertRedirect(route('dashboard'));
});

test('banners can be listed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    Banner::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('admin.banners.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/banners/index')
            ->has('banners.data', 3)
            ->where('banners.total', 3));
});

test('banners can be filtered by search and status', function () {
    $admin = User::factory()->asAdmin()->create();
    Banner::factory()->create(['title' => 'Summer sale']);
    Banner::factory()->inactive()->create(['title' => 'Old promo']);

    $this->actingAs($admin)
        ->get(route('admin.banners.index', ['search' => 'summer']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('banners.data', 1)
            ->where('banners.data.0.title', 'Summer sale'));

    $this->actingAs($admin)
        ->get(route('admin.banners.index', ['status' => 'inactive']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('banners.data', 1)
            ->where('banners.data.0.is_active', false));
});

test('a banner detail page can be viewed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    $banner = Banner::factory()->create(['title' => 'Summer sale']);

    $this->actingAs($admin)
        ->get(route('admin.banners.show', $banner))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/banners/show')
            ->where('banner.title', 'Summer sale'));
});

test('a banner can be created with an image', function () {
    Storage::fake('public');

    $admin = User::factory()->asAdmin()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.banners.store'), [
            'title' => 'New sets weekly',
            'subtitle' => 'Fresh singles and booster boxes.',
            'image' => UploadedFile::fake()->image('banner.jpg'),
            'link_url' => '/catalog',
            'sort_order' => 1,
            'is_active' => true,
        ]);

    $banner = Banner::where('title', 'New sets weekly')->firstOrFail();

    $response->assertRedirect(route('admin.banners.show', $banner));

    expect($banner->subtitle)->toBe('Fresh singles and booster boxes.');
    expect($banner->link_url)->toBe('/catalog');
    expect($banner->sort_order)->toBe(1);
    expect($banner->is_active)->toBeTrue();
    Storage::disk('public')->assertExists($banner->image);
});

test('banner uploads are normalized into desktop and mobile webp variants', function () {
    Storage::fake('public');

    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.banners.store'), [
            'title' => 'Variants banner',
            'sort_order' => 0,
            'is_active' => true,
            'image' => UploadedFile::fake()->image('wide.jpg', 2000, 700),
        ])
        ->assertRedirect();

    $banner = Banner::where('title', 'Variants banner')->firstOrFail();

    expect($banner->image)->not->toBeNull();
    expect($banner->image_mobile)->not->toBeNull();
    expect($banner->image)->not->toBe($banner->image_mobile);

    Storage::disk('public')->assertExists($banner->image);
    Storage::disk('public')->assertExists($banner->image_mobile);
});

test('a banner accepts is_active submitted as a string, like the browser sends it', function () {
    Storage::fake('public');

    $admin = User::factory()->asAdmin()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.banners.store'), [
            'title' => 'String boolean banner',
            'sort_order' => 0,
            'is_active' => 'true',
        ]);

    $banner = Banner::where('title', 'String boolean banner')->firstOrFail();

    $response->assertRedirect(route('admin.banners.show', $banner));

    expect($banner->is_active)->toBeTrue();

    $this->actingAs($admin)
        ->put(route('admin.banners.update', $banner), [
            'title' => 'String boolean banner',
            'sort_order' => 0,
            'is_active' => 'false',
        ])
        ->assertRedirect(route('admin.banners.show', $banner));

    expect($banner->refresh()->is_active)->toBeFalse();
});

test('banner validation requires a title and sort order', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.banners.store'), [
            'title' => '',
            'sort_order' => 'not-a-number',
        ])
        ->assertSessionHasErrors(['title', 'sort_order']);
});

test('a banner can be updated and its image replaced', function () {
    Storage::fake('public');

    $admin = User::factory()->asAdmin()->create();
    $banner = Banner::factory()->withImage()->create(['title' => 'Old banner']);
    $oldImage = $banner->image;

    $this->actingAs($admin)
        ->put(route('admin.banners.update', $banner), [
            'title' => 'Updated banner',
            'subtitle' => 'New copy.',
            'link_url' => '/catalog?status=pre-order',
            'sort_order' => 5,
            'is_active' => false,
            'image' => UploadedFile::fake()->image('new-banner.jpg'),
        ])
        ->assertRedirect(route('admin.banners.show', $banner));

    $banner->refresh();

    expect($banner->title)->toBe('Updated banner');
    expect($banner->sort_order)->toBe(5);
    expect($banner->is_active)->toBeFalse();
    Storage::disk('public')->assertMissing($oldImage);
    Storage::disk('public')->assertExists($banner->image);
});

test('a banner can be deleted along with its image', function () {
    Storage::fake('public');

    $admin = User::factory()->asAdmin()->create();
    $banner = Banner::factory()->withImage()->create();
    $image = $banner->image;

    $this->actingAs($admin)
        ->delete(route('admin.banners.destroy', $banner))
        ->assertRedirect(route('admin.banners.index'));

    $this->assertDatabaseMissing('banners', ['id' => $banner->id]);
    Storage::disk('public')->assertMissing($image);
});

test('only active banners are shown on the home page, ordered by sort order', function () {
    Banner::factory()->inactive()->create(['title' => 'Hidden banner']);
    Banner::factory()->create(['title' => 'Second banner', 'sort_order' => 2]);
    Banner::factory()->create(['title' => 'First banner', 'sort_order' => 1]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('banners', 2)
            ->where('banners.0.title', 'First banner')
            ->where('banners.1.title', 'Second banner'));
});
