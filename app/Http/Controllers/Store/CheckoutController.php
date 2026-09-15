<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\CheckoutRequest;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\Province;
use App\Models\ShopSetting;
use App\Services\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    /**
     * Show the checkout page.
     */
    public function index(Request $request, Cart $cart): Response|RedirectResponse
    {
        if ($cart->isEmpty()) {
            return redirect()->route('cart.index');
        }

        $promo = $this->promoFor($cart);
        $discount = $promo['discount'] ?? 0.0;
        $whatsappNumber = ShopSetting::get('whatsapp_number');

        return Inertia::render('store/checkout', [
            'cartItems' => $cart->items(),
            'subtotal' => $cart->subtotal(),
            'shippingFee' => $cart->shippingFee(),
            'discount' => $discount,
            'downPayment' => $cart->downPayment(),
            'total' => round($cart->subtotal() + $cart->shippingFee() - $discount, 2),
            'paymentMethods' => PaymentMethod::activeList(),
            'promo' => $promo,
            'whatsappNumber' => $whatsappNumber ?: null,
            'customerName' => $request->user()->name,
            'addresses' => $request->user()
                ->addresses()
                ->orderByDesc('is_default')
                ->orderByDesc('id')
                ->get(),
            'provinces' => Province::query()
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Place an order from the current cart.
     */
    public function store(CheckoutRequest $request, Cart $cart): RedirectResponse
    {
        if ($cart->isEmpty()) {
            return redirect()->route('cart.index');
        }

        foreach ($cart->items() as $item) {
            $product = $item['product'];

            if (in_array($product->status, [Product::STATUS_READY, Product::STATUS_PRE_ORDER], true)
                && $item['quantity'] > $product->stock) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => $product->status === Product::STATUS_PRE_ORDER
                        ? __('shop.cart_only_preorder_units', ['count' => $product->stock])
                        : __('shop.checkout_product_unavailable_quantity', ['product' => $product->name]),
                ]);

                return back();
            }

            if ($product->status === Product::STATUS_PRE_ORDER && ! $product->isPreOrderWindowOpen()) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => __('shop.checkout_preorder_closed', ['product' => $product->name]),
                ]);

                return back();
            }
        }

        $order = DB::transaction(function () use ($request, $cart): Order {
            $user = $request->user();
            $address = $user->addresses()->findOrFail((int) $request->validated('address_id'));

            $promo = $this->promoFor($cart);
            $discount = $promo['discount'] ?? 0.0;
            $shippingFee = $cart->shippingFee();
            $subtotal = $cart->subtotal();
            $downPayment = $cart->downPayment();

            $order = Order::create([
                'customer_id' => $user->id,
                'status' => Order::STATUS_PENDING,
                'payment_method' => $request->input('payment_method'),
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                'promo_code_id' => $promo['id'] ?? null,
                'subtotal' => $subtotal,
                'down_payment' => $downPayment,
                'shipping_fee' => $shippingFee,
                'discount' => $discount,
                'total' => round($subtotal + $shippingFee - $discount, 2),
                'notes' => $request->input('notes'),
                'receiver_name' => $address->receiver_name,
                'shipping_address' => $address->address,
                'shipping_city' => $address->city,
                'shipping_province' => $address->province,
                'shipping_district' => $address->district,
                'shipping_subdistrict' => $address->subdistrict,
                'shipping_zip' => $address->zip,
            ]);

            if ($promo) {
                PromoCode::whereKey($promo['id'])->increment('uses_count');
            }

            foreach ($cart->items() as $item) {
                /** @var Product $product */
                $product = $item['product'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image' => $product->images->first()?->image,
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                ]);

                if ($product->status === Product::STATUS_READY) {
                    $product->decrement('stock', $item['quantity']);
                }
            }

            session()->forget('cart.promo');
            $cart->clear();

            return $order;
        });

        return redirect()->route('orders.confirmation', $order);
    }

    /**
     * Show the confirmation for a freshly placed order.
     */
    public function confirmation(Order $order): Response
    {
        abort_if($order->customer_id !== auth()->id(), 403);

        $order->load(['items', 'promoCode']);

        return Inertia::render('store/orders/confirmation', [
            'order' => $order,
            'paymentMethods' => PaymentMethod::options(),
            'whatsappNumber' => ShopSetting::get('whatsapp_number') ?: null,
        ]);
    }

    /**
     * Resolve the promo code applied to the current cart, if it is still valid.
     *
     * @return array{id: int, code: string, name: string, discount: float}|null
     */
    private function promoFor(Cart $cart): ?array
    {
        $code = session('cart.promo');

        if (! is_string($code) || $code === '') {
            return null;
        }

        $promo = PromoCode::where('code', $code)->first();
        $subtotal = $cart->subtotal();

        if (! $promo || ! $promo->isValidForSubtotal($subtotal)) {
            return null;
        }

        return [
            'id' => $promo->id,
            'code' => $promo->code,
            'name' => $promo->name,
            'discount' => $promo->discountFor($subtotal),
        ];
    }
}
