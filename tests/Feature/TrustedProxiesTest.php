<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

test('requests through cloudflare resolve the real client ip and scheme', function () {
    Route::get('/_test-proxy-check', fn (Request $request) => response()->json([
        'ip' => $request->ip(),
        'scheme' => $request->getScheme(),
        'host' => $request->getHost(),
    ]));

    $response = $this
        ->withServerVariables(['REMOTE_ADDR' => '104.16.0.10'])
        ->withHeaders([
            'X-Forwarded-For' => '203.0.113.7',
            'X-Forwarded-Proto' => 'https',
            'X-Forwarded-Host' => 'shop.example.com',
        ])
        ->getJson('/_test-proxy-check');

    $response
        ->assertOk()
        ->assertJson([
            'ip' => '203.0.113.7',
            'scheme' => 'https',
            'host' => 'shop.example.com',
        ]);
});
