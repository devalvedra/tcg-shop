<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePasswordRequest;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\Order;
use App\Models\ShopSetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Show the admin settings page.
     */
    public function index(Request $request): Response
    {
        $settings = ShopSetting::allSettings();
        $storeLogo = $settings['store_logo'] ?? null;

        return Inertia::render('admin/settings/index', [
            'adminTimezone' => $request->user()->timezone ?? User::DEFAULT_TIMEZONE,
            'settings' => [
                'store_name' => $settings['store_name'] ?? config('app.name'),
                'store_email' => $settings['store_email'] ?? null,
                'store_phone' => $settings['store_phone'] ?? null,
                'store_address' => $settings['store_address'] ?? null,
                'store_logo' => $storeLogo,
                'store_logo_url' => $storeLogo ? Storage::disk('public')->url($storeLogo) : null,
                'customer_verification' => $settings['customer_verification'] ?? '0',
                'cancel_order_enabled' => $settings['cancel_order_enabled'] ?? '1',
                'cancel_order_hours' => $settings['cancel_order_hours'] ?? '1',
                'general_description' => $settings['general_description'] ?? null,
                'whatsapp_number' => $settings['whatsapp_number'] ?? null,
                'shipping_fee' => $settings['shipping_fee'] ?? (string) Order::SHIPPING_FEE,
                'free_shipping_threshold' => $settings['free_shipping_threshold'] ?? (string) Order::FREE_SHIPPING_THRESHOLD,
                'locale' => $settings['locale'] ?? config('app.locale', 'en'),
                'currency' => $settings['currency'] ?? 'usd',
            ],
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    /**
     * Update the shop settings.
     */
    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $values = $request->validated();

        // The administrator's own time zone lives on the users table,
        // not in the shop settings store.
        $timezone = $values['timezone'] ?? null;
        unset($values['timezone'], $values['store_logo']);

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

        if (is_string($timezone)) {
            $request->user()->update(['timezone' => $timezone]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.settings_updated')]);

        return back();
    }

    /**
     * Update the administrator's password.
     */
    public function updatePassword(UpdatePasswordRequest $request): RedirectResponse
    {
        $request->user()->update([
            'password' => $request->password,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.password_updated')]);

        return back();
    }
}
