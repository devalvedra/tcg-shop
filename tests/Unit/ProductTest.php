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

test('the youtube video id is extracted from common link formats', function (string $link, ?string $expected) {
    $product = new Product(['youtube_link' => $link]);

    expect($product->youtubeVideoId())->toBe($expected);
})->with([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLxyz&index=2', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?app=desktop&v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/live/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://example.com/watch?v=dQw4w9WgXcQ', null],
    ['not a link', null],
]);

test('the youtube embed url is built with the rel parameter', function () {
    $product = new Product(['youtube_link' => 'https://youtu.be/dQw4w9WgXcQ']);

    expect($product->youtubeEmbedUrl())->toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0');
});
