<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\AddToCartRequest;
use App\Models\Order;
use App\Models\Product;
use App\Models\ShopSetting;
use App\Services\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Show the customer's shopping cart.
     */
    public function index(Cart $cart): Response
    {
        $reconciled = $cart->reconcile();

        if ($reconciled['removed'] !== []) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => count($reconciled['removed']) === 1
                    ? __('shop.cart_item_unavailable_removed', ['product' => $reconciled['removed'][0]])
                    : __('shop.cart_items_unavailable_removed'),
            ]);
        } elseif ($reconciled['clamped']) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => __('shop.cart_quantities_adjusted'),
            ]);
        }

        return Inertia::render('store/cart', [
            'cartItems' => $cart->items(),
            'subtotal' => $cart->subtotal(),
            'shippingFee' => $cart->shippingFee(),
            'total' => $cart->total(),
            'downPayment' => $cart->downPayment(),
            'freeShippingThreshold' => (float) (ShopSetting::get('free_shipping_threshold') ?? Order::FREE_SHIPPING_THRESHOLD),
        ]);
    }

    /**
     * Add a product to the cart.
     */
    public function store(AddToCartRequest $request, Product $product, Cart $cart): RedirectResponse
    {
        $quantity = $request->integer('quantity');

        if ($product->status === Product::STATUS_UNAVAILABLE) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('shop.cart_product_unavailable'),
            ]);

            return back();
        }

        if ($product->status === Product::STATUS_PRE_ORDER && ! $product->isPreOrderWindowOpen()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('shop.cart_preorder_not_open'),
            ]);

            return back();
        }

        if (in_array($product->status, [Product::STATUS_READY, Product::STATUS_PRE_ORDER], true)) {
            $statuses = $cart->items()
                ->map(fn (array $item): string => $item['product']->status)
                ->intersect([Product::STATUS_READY, Product::STATUS_PRE_ORDER])
                ->unique()
                ->values();

            if ($statuses->isNotEmpty() && ! $statuses->contains($product->status)) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => $product->status === Product::STATUS_PRE_ORDER
                        ? __('shop.cart_cannot_mix_preorder')
                        : __('shop.cart_cannot_mix_ready'),
                ]);

                return back();
            }
        }

        if (in_array($product->status, [Product::STATUS_READY, Product::STATUS_PRE_ORDER], true)) {
            $stock = $cart->quantity($product->id) + $quantity;

            if ($stock > $product->stock) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => $product->status === Product::STATUS_PRE_ORDER
                        ? "Only {$product->stock} units are available for pre-order."
                        : "Only {$product->stock} left in stock.",
                ]);

                return back();
            }
        }

        $cart->add($product, $quantity);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('shop.cart_product_added', ['product' => $product->name]),
        ]);

        return back();
    }

    /**
     * Update the quantity of a cart item.
     */
    public function update(Request $request, Product $product, Cart $cart): RedirectResponse
    {
        $quantity = $request->input('quantity') !== null
            ? max(1, $request->integer('quantity'))
            : null;

        if (in_array($product->status, [Product::STATUS_READY, Product::STATUS_PRE_ORDER], true)
            && $quantity !== null
            && $quantity > $product->stock) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => $product->status === Product::STATUS_PRE_ORDER
                    ? __('shop.cart_only_preorder_units', ['count' => $product->stock])
                    : __('shop.cart_only_left_in_stock', ['count' => $product->stock]),
            ]);

            return back();
        }

        $cart->update($product, $quantity);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('shop.cart_updated'),
        ]);

        return back();
    }

    /**
     * Remove a product from the cart.
     */
    public function destroy(Product $product, Cart $cart): RedirectResponse
    {
        $cart->remove($product);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('shop.cart_product_removed', ['product' => $product->name]),
        ]);

        return back();
    }
}
