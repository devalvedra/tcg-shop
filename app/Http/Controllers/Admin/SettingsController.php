<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\Order;
use App\Models\ShopSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Show the admin settings page.
     */
    public function index(): Response
    {
        $settings = ShopSetting::allSettings();
        $storeLogo = $settings['store_logo'] ?? null;

        return Inertia::render('admin/settings/index', [
            'settings' => [
                'store_name' => $settings['store_name'] ?? 'TCG Shop',
                'store_email' => $settings['store_email'] ?? null,
                'store_phone' => $settings['store_phone'] ?? null,
                'store_address' => $settings['store_address'] ?? null,
                'store_logo' => $storeLogo,
                'store_logo_url' => $storeLogo ? Storage::disk('public')->url($storeLogo) : null,
                'customer_verification' => $settings['customer_verification'] ?? '0',
                'whatsapp_number' => $settings['whatsapp_number'] ?? null,
                'shipping_fee' => $settings['shipping_fee'] ?? (string) Order::SHIPPING_FEE,
                'free_shipping_threshold' => $settings['free_shipping_threshold'] ?? (string) Order::FREE_SHIPPING_THRESHOLD,
                'locale' => $settings['locale'] ?? config('app.locale', 'en'),
                'currency' => $settings['currency'] ?? 'usd',
            ],
        ]);
    }

    /**
     * Update the shop settings.
     */
    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $values = $request->validated();
        unset($values['store_logo']);

        if ($request->boolean('store_logo_remove') && $current = ShopSetting::get('store_logo')) {
            Storage::disk('public')->delete($current);
            $values['store_logo'] = null;
        }

        if ($request->hasFile('store_logo')) {
            if ($current = ShopSetting::get('store_logo')) {
                Storage::disk('public')->delete($current);
            }

            $values['store_logo'] = $request->file('store_logo')->store('logos', 'public');
        }

        ShopSetting::setMany($values);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.settings_updated')]);

        return back();
    }
}
