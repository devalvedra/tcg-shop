<?php

use App\Models\Product;
use App\Models\User;
use Database\Seeders\ProductCategorySeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(ProductCategorySeeder::class);
});

test('guests are redirected to the login page', function () {
    $this->get(route('admin.products.index'))->assertRedirect(route('admin.login'));
});

test('customers cannot access the admin product pages', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.products.index'))
        ->assertRedirect(route('dashboard'));
});

test('products can be listed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    Product::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get(route('admin.products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/products/index')
            ->has('products.data', 3)
            ->where('products.total', 3));
});

test('a product detail page can be viewed by an admin', function () {
    $admin = User::factory()->asAdmin()->create();
    $product = Product::factory()->withImages(1)->create([
        'name' => 'Charizard VMAX',
        'category' => 'singles',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.products.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/products/show')
            ->where('product.name', 'Charizard VMAX')
            ->where('product.category', 'singles')
            ->has('product.images', 1));
});

test('products can be filtered by search, status, and category', function () {
    $admin = User::factory()->asAdmin()->create();
    Product::factory()->create(['name' => 'Charizard EX', 'category' => 'singles']);
    Product::factory()->preOrder()->create(['name' => 'Paradox Rift Booster Box', 'category' => 'booster-boxes']);

    $this->actingAs($admin)
        ->get(route('admin.products.index', ['search' => 'charizard']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Charizard EX'));

    $this->actingAs($admin)
        ->get(route('admin.products.index', ['status' => Product::STATUS_PRE_ORDER]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.status', Product::STATUS_PRE_ORDER));

    $this->actingAs($admin)
        ->get(route('admin.products.index', ['category' => 'booster-boxes']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.category', 'booster-boxes'));
});

test('products can be sorted by name', function () {
    $admin = User::factory()->asAdmin()->create();
    Product::factory()->create(['name' => 'Bravo Box']);
    Product::factory()->create(['name' => 'Alpha Card']);
    Product::factory()->create(['name' => 'Charlie Pack']);

    $this->actingAs($admin)
        ->get(route('admin.products.index', ['sort' => 'name', 'direction' => 'asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('products.data.0.name', 'Alpha Card')
            ->where('products.data.2.name', 'Charlie Pack'));

    $this->actingAs($admin)
        ->get(route('admin.products.index', ['sort' => 'name', 'direction' => 'desc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('products.data.0.name', 'Charlie Pack'));
});

test('product images can be reordered', function () {
    $admin = User::factory()->asAdmin()->create();
    $product = Product::factory()->withImages(3)->create();

    $images = $product->images()->orderBy('sort_order')->get();
    $expected = $images->pluck('id')->reverse()->values()->all();

    $this->actingAs($admin)
        ->put(route('admin.products.update', $product), [
            'name' => $product->name,
            'category' => $product->category,
            'price' => $product->price,
            'stock' => $product->stock,
            'status' => Product::STATUS_READY,
            'image_order' => $images
                ->reverse()
                ->map(fn ($image) => "id:{$image->id}")
                ->values()
                ->all(),
        ])
        ->assertRedirect(route('admin.products.show', $product));

    $reordered = $product->fresh()
        ->images()
        ->orderBy('sort_order')
        ->pluck('id')
        ->all();

    expect($reordered)->toBe($expected);
});

test('a product can be created with images', function () {
    Storage::fake('public');

    $admin = User::factory()->asAdmin()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'name' => 'Charizard EX',
            'description' => 'Classic chase card.',
            'category' => 'singles',
            'price' => '92.00',
            'sell_price' => '84.00',
            'stock' => 12,
            'status' => Product::STATUS_READY,
            'images' => [
                UploadedFile::fake()->image('front.jpg'),
                UploadedFile::fake()->image('back.jpg'),
            ],
        ]);

    $product = Product::where('name', 'Charizard EX')->firstOrFail();

    $response->assertRedirect(route('admin.products.show', $product));

    $this->assertDatabaseHas('products', [
        'name' => 'Charizard EX',
        'category' => 'singles',
        'price' => 92.00,
        'sell_price' => 84.00,
        'stock' => 12,
        'status' => Product::STATUS_READY,
    ]);

    $this->assertDatabaseHas('product_images', [
        'product_id' => $product->id,
        'sort_order' => 0,
    ]);

    $this->assertCount(2, $product->images);
    Storage::disk('public')->assertExists($product->images->first()->image);
});

test('a product can be created with a down payment and youtube link', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'name' => 'Charizard EX',
            'description' => 'Classic chase card.',
            'youtube_link' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'category' => 'singles',
            'price' => '92.00',
            'down_payment' => '25.00',
            'stock' => 12,
            'status' => Product::STATUS_READY,
        ])
        ->assertRedirect();

    $product = Product::where('name', 'Charizard EX')->firstOrFail();

    expect((float) $product->down_payment)->toBe(25.0);
    expect($product->youtube_link)->toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect($product->youtubeEmbedUrl())->toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0');
});

test('an empty down payment defaults to zero', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'name' => 'Snorlax',
            'category' => 'singles',
            'price' => '10.00',
            'down_payment' => '',
            'stock' => 1,
            'status' => Product::STATUS_READY,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'name' => 'Snorlax',
        'down_payment' => 0,
    ]);
});

test('product images larger than two megabytes are rejected', function () {
    Storage::fake('public');

    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'name' => 'Large Image Card',
            'category' => 'singles',
            'price' => '10.00',
            'stock' => 1,
            'status' => Product::STATUS_READY,
            'images' => [
                UploadedFile::fake()->image('huge.jpg')->size(2049),
            ],
        ])
        ->assertSessionHasErrors('images.0');

    $this->assertDatabaseMissing('products', ['name' => 'Large Image Card']);
});

test('product images up to two megabytes are accepted', function () {
    Storage::fake('public');

    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'name' => 'Valid Image Card',
            'category' => 'singles',
            'price' => '10.00',
            'stock' => 1,
            'status' => Product::STATUS_READY,
            'images' => [
                UploadedFile::fake()->image('ok.jpg')->size(2000),
            ],
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('products', ['name' => 'Valid Image Card']);
});

test('product validation requires name, category, price, stock, and status', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'name' => '',
            'category' => 'not-a-real-category',
            'price' => 'not-a-number',
            'stock' => 'not-a-number',
            'status' => 'not-a-status',
        ])
        ->assertSessionHasErrors(['name', 'category', 'price', 'stock', 'status']);
});

test('a pre-order product requires an open and close date', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'name' => 'Booster Box',
            'category' => 'booster-boxes',
            'price' => '149.99',
            'stock' => 0,
            'status' => Product::STATUS_PRE_ORDER,
            'open_po_date' => '',
            'close_po_date' => '',
        ])
        ->assertSessionHasErrors(['open_po_date', 'close_po_date']);
});

test('the close date must be after the open date', function () {
    $admin = User::factory()->asAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'name' => 'Booster Box',
            'category' => 'booster-boxes',
            'price' => '149.99',
            'stock' => 0,
            'status' => Product::STATUS_PRE_ORDER,
            'open_po_date' => '2026-08-30',
            'close_po_date' => '2026-08-10',
        ])
        ->assertSessionHasErrors('close_po_date');
});

test('pre-order dates are exposed on the edit page for the date input', function () {
    $admin = User::factory()->asAdmin()->create();
    $product = Product::factory()->preOrder()->create([
        'open_po_date' => '2026-08-17',
        'close_po_date' => '2026-09-30',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.products.edit', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/products/edit')
            ->where('product.open_po_date', '2026-08-17')
            ->where('product.close_po_date', '2026-09-30'));
});

test('a pre-order products dates can be updated', function () {
    $admin = User::factory()->asAdmin()->create();
    $product = Product::factory()->preOrder()->create([
        'open_po_date' => '2026-08-17',
        'close_po_date' => '2026-09-30',
    ]);

    $this->actingAs($admin)
        ->put(route('admin.products.update', $product), [
            'name' => $product->name,
            'category' => $product->category,
            'price' => $product->price,
            'stock' => $product->stock,
            'status' => Product::STATUS_PRE_ORDER,
            'open_po_date' => '2026-09-01',
            'close_po_date' => '2026-10-15',
        ])
        ->assertRedirect(route('admin.products.show', $product));

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'open_po_date' => '2026-09-01',
        'close_po_date' => '2026-10-15',
    ]);
});

test('a product can be updated and existing images replaced', function () {
    Storage::fake('public');

    $admin = User::factory()->asAdmin()->create();
    $product = Product::factory()->withImages(2)->create();
    $imageToRemove = $product->images()->first();

    $this->actingAs($admin)
        ->put(route('admin.products.update', $product), [
            'name' => 'Charizard EX Holo',
            'category' => 'singles',
            'price' => '105.00',
            'stock' => 5,
            'status' => Product::STATUS_READY,
            'delete_images' => [$imageToRemove->id],
            'images' => [UploadedFile::fake()->image('replacement.jpg')],
        ])
        ->assertRedirect(route('admin.products.show', $product));

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Charizard EX Holo',
        'price' => 105.00,
        'stock' => 5,
    ]);

    $product->refresh();

    $this->assertCount(2, $product->images);
    $this->assertDatabaseMissing('product_images', ['id' => $imageToRemove->id]);
    Storage::disk('public')->assertMissing($imageToRemove->image);
});

test('a product can be deleted along with its images', function () {
    Storage::fake('public');

    $admin = User::factory()->asAdmin()->create();
    $product = Product::factory()->withImages(2)->create();
    $imagePaths = $product->images->pluck('image')->all();

    $this->actingAs($admin)
        ->delete(route('admin.products.destroy', $product))
        ->assertRedirect(route('admin.products.index'));

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
    $this->assertDatabaseMissing('product_images', ['product_id' => $product->id]);

    foreach ($imagePaths as $path) {
        Storage::disk('public')->assertMissing($path);
    }
});
