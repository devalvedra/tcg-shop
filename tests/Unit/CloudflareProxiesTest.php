<?php

use App\Support\CloudflareProxies;
use Tests\TestCase;

uses(TestCase::class);

test('cloudflare ranges are trusted by default', function () {
    $trusted = CloudflareProxies::trusted();

    expect($trusted)->toBeArray();
    expect($trusted)->toContain('104.16.0.0/13');
    expect($trusted)->toContain('2606:4700::/32');
});

test('a configured TRUSTED_PROXIES value overrides the cloudflare ranges', function () {
    putenv('TRUSTED_PROXIES=10.0.0.0/8, 192.168.0.1');

    try {
        expect(CloudflareProxies::trusted())->toBe('10.0.0.0/8, 192.168.0.1');
    } finally {
        putenv('TRUSTED_PROXIES');
    }
});
