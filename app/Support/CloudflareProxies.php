<?php

namespace App\Support;

/**
 * Cloudflare edge network proxies.
 *
 * The shop is served behind Cloudflare, so its IPs must be trusted for
 * HTTPS detection, client IPs, and forwarded hosts to resolve correctly.
 * Set a comma-separated TRUSTED_PROXIES env value to override (use '*' to
 * trust the calling IP, e.g. behind other load balancers).
 *
 * @see https://www.cloudflare.com/ips
 */
final class CloudflareProxies
{
    /**
     * Cloudflare's published IPv4/IPv6 ranges.
     *
     * @var list<string>
     */
    public const array RANGES = [
        '103.21.244.0/22',
        '103.22.200.0/22',
        '103.31.4.0/22',
        '104.16.0.0/13',
        '104.24.0.0/14',
        '108.162.192.0/18',
        '131.0.72.0/22',
        '141.101.64.0/18',
        '162.158.0.0/15',
        '172.64.0.0/13',
        '173.245.48.0/20',
        '188.114.96.0/20',
        '190.93.240.0/20',
        '197.234.240.0/22',
        '198.41.128.0/17',
        '2400:cb00::/32',
        '2606:4700::/32',
        '2803:f800::/32',
        '2405:b500::/32',
        '2405:8100::/32',
        '2a06:98c0::/29',
        '2c0f:f248::/32',
    ];

    /**
     * The proxy IPs/CIDRs the application should trust.
     *
     * Reads the process environment directly (instead of the `env()`
     * helper) so the setting keeps working when the config is cached.
     *
     * @return array<int, string>|string
     */
    public static function trusted(): array|string
    {
        $configured = $_SERVER['TRUSTED_PROXIES'] ?? getenv('TRUSTED_PROXIES');

        if (! is_string($configured)) {
            $configured = '';
        }

        $configured = trim($configured);

        if ($configured === '') {
            return self::RANGES;
        }

        return $configured;
    }
}
