<?php

namespace App\Http\Middleware;

use App\Models\ShopSetting;
use App\Services\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * The locales the shop supports.
     *
     * @var array<int, string>
     */
    public const array LOCALES = ['en', 'id'];

    /**
     * The currencies the shop supports.
     *
     * @var array<int, string>
     */
    public const array CURRENCIES = ['usd', 'idr'];

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = $this->locale();

        app()->setLocale($locale);

        return [
            ...parent::share($request),
            'name' => ShopSetting::get('store_name') ?: null,
            'logo' => $this->logoUrl(),
            'locale' => $locale,
            'translations' => fn () => $this->translations($locale),
            'currency' => $this->currency(),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'cartCount' => fn () => app(Cart::class)->count(),
        ];
    }

    /**
     * The public URL of the store logo, if one has been uploaded.
     */
    private function logoUrl(): ?string
    {
        $logo = ShopSetting::get('store_logo');

        return $logo ? Storage::disk('public')->url($logo) : null;
    }

    /**
     * The active shop locale, falling back to the application default.
     */
    private function locale(): string
    {
        $locale = ShopSetting::get('locale', config('app.locale', 'en'));

        return in_array($locale, self::LOCALES, true) ? $locale : 'en';
    }

    /**
     * The active shop currency, falling back to the US Dollar.
     */
    private function currency(): string
    {
        $currency = ShopSetting::get('currency', 'usd');

        return in_array($currency, self::CURRENCIES, true) ? $currency : 'usd';
    }

    /**
     * Load the JSON translation file for the given locale, if present.
     *
     * @return array<string, string>
     */
    private function translations(string $locale): array
    {
        $path = lang_path("{$locale}.json");

        if (! is_file($path)) {
            return [];
        }

        $translations = json_decode((string) file_get_contents($path), true);

        return is_array($translations) ? $translations : [];
    }
}
