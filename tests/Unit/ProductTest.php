<?php

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('the pre-order window is open when the current date falls between the dates', function () {
    $product = Product::factory()->preOrder()->create([
        'open_po_date' => now()->subDays(3)->toDateString(),
        'close_po_date' => now()->addDays(3)->toDateString(),
    ]);

    expect($product->isPreOrderWindowOpen())->toBeTrue();
});

test('the pre-order window is closed before the open date', function () {
    $product = Product::factory()->preOrder()->create([
        'open_po_date' => now()->addDays(3)->toDateString(),
        'close_po_date' => now()->addDays(7)->toDateString(),
    ]);

    expect($product->isPreOrderWindowOpen())->toBeFalse();
});

test('the pre-order window is closed after the close date', function () {
    $product = Product::factory()->preOrder()->create([
        'open_po_date' => now()->subDays(7)->toDateString(),
        'close_po_date' => now()->subDays(3)->toDateString(),
    ]);

    expect($product->isPreOrderWindowOpen())->toBeFalse();
});

test('the pre-order window is closed on the close date', function () {
    $product = Product::factory()->preOrder()->create([
        'open_po_date' => now()->subDays(7)->toDateString(),
        'close_po_date' => now()->toDateString(),
    ]);

    expect($product->isPreOrderWindowOpen(Carbon::now()->endOfDay()))->toBeTrue();
    expect($product->isPreOrderWindowOpen(Carbon::now()->addDay()->startOfDay()))->toBeFalse();
});

test('ready products never have an open pre-order window', function () {
    $product = Product::factory()->create([
        'status' => Product::STATUS_READY,
    ]);

    expect($product->isPreOrderWindowOpen())->toBeFalse();
});
