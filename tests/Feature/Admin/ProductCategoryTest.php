<?php

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page for categories', function () {
    $this->get(route('admin.categories.index'))->assertRedirect(route('admin.login'));
});

test('customers cannot access the admin category pages', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.categories.index'))
        ->assertRedirect(route('dashboard'));
});

test('categories can be listed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    ProductCategory::factory()->create(['name' => 'Playmats', 'slug' => 'playmats']);

    $this->actingAs($admin)
        ->get(route('admin.categories.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/categories/index')
            ->has('categories.data', 1)
            ->where('categories.data.0.name', 'Playmats')
            ->where('categories.data.0.slug', 'playmats'));
});

test('categories can be searched', function () {
    $admin = User::factory()->asAdmin()->create();
    ProductCategory::factory()->create(['name' => 'Playmats', 'slug' => 'playmats']);
    ProductCategory::factory()->create(['name' => 'Sleeves', 'slug' => 'sleeves']);

    $this->actingAs($admin)
        ->get(route('admin.categories.index', ['search' => 'sleeve']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('categories.data', 1)
            ->where('categories.data.0.slug', 'sleeves'));
});

test('an admin can create a category with an auto-generated slug', function () {
    $admin = User::factory()->asAdmin()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.categories.store'), [
            'name' => 'Booster Boxes',
            'slug' => '',
        ]);

    $category = ProductCategory::where('slug', 'booster-boxes')->firstOrFail();

    $response->assertRedirect(route('admin.categories.show', $category));

    $this->assertDatabaseHas('product_categories', [
        'name' => 'Booster Boxes',
        'slug' => 'booster-boxes',
    ]);
});

test('an admin can create a category with a custom slug', function () {
    $admin = User::factory()->asAdmin()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.categories.store'), [
            'name' => 'Playmats',
            'slug' => 'playmats',
        ]);

    $category = ProductCategory::where('slug', 'playmats')->firstOrFail();

    $response->assertRedirect(route('admin.categories.show', $category));

    $this->assertDatabaseHas('product_categories', [
        'name' => 'Playmats',
        'slug' => 'playmats',
    ]);
});

test('a category requires a unique name and valid slug', function () {
    $admin = User::factory()->asAdmin()->create();
    ProductCategory::factory()->create(['name' => 'Singles', 'slug' => 'singles']);

    $this->actingAs($admin)
        ->post(route('admin.categories.store'), [
            'name' => 'Singles',
            'slug' => 'Invalid Slug!',
        ])
        ->assertSessionHasErrors(['name', 'slug']);
});

test('an admin can update a category', function () {
    $admin = User::factory()->asAdmin()->create();
    $category = ProductCategory::factory()->create(['name' => 'Playmats', 'slug' => 'playmats']);

    $this->actingAs($admin)
        ->put(route('admin.categories.update', $category), [
            'name' => 'Play Mats',
            'slug' => 'play-mats',
        ])
        ->assertRedirect(route('admin.categories.show', $category));

    $this->assertDatabaseHas('product_categories', [
        'id' => $category->id,
        'name' => 'Play Mats',
        'slug' => 'play-mats',
    ]);
});

test('a category detail page can be viewed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    $category = ProductCategory::factory()->create([
        'name' => 'Singles',
        'slug' => 'singles',
    ]);
    Product::factory()->create(['category' => 'singles']);

    $this->actingAs($admin)
        ->get(route('admin.categories.show', $category))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/categories/show')
            ->where('category.name', 'Singles')
            ->where('productCount', 1));
});

test('a category with products assigned cannot be deleted', function () {
    $admin = User::factory()->asAdmin()->create();
    $category = ProductCategory::factory()->create(['name' => 'Singles', 'slug' => 'singles']);
    Product::factory()->create(['category' => 'singles']);

    $this->actingAs($admin)
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect();

    $this->assertDatabaseHas('product_categories', ['id' => $category->id]);
});

test('an empty category can be deleted', function () {
    $admin = User::factory()->asAdmin()->create();
    $category = ProductCategory::factory()->create(['name' => 'Playmats', 'slug' => 'playmats']);

    $this->actingAs($admin)
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseMissing('product_categories', ['id' => $category->id]);
});
