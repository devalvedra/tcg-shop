<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Services\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromoController extends Controller
{
    /**
     * Apply a promo code to the current cart.
     */
    public function apply(Request $request, Cart $cart): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string', 'max:50']]);

        $code = strtoupper((string) preg_replace('/\s+/', '', $request->input('code') ?? ''));
        $promo = PromoCode::where('code', $code)->first();

        if (! $promo || ! $promo->isValidForSubtotal($cart->subtotal())) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('shop.promo_code_invalid'),
            ]);

            return back();
        }

        session(['cart.promo' => $code]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.promo_code_applied')]);

        return back();
    }

    /**
     * Remove the applied promo code from the current cart.
     */
    public function remove(): RedirectResponse
    {
        session()->forget('cart.promo');

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.promo_code_removed')]);

        return back();
    }
}
