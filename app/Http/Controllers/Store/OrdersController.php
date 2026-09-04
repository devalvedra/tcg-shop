<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrdersController extends Controller
{
    /**
     * Show the authenticated customer's order history.
     */
    public function index(Request $request): Response
    {
        $orders = $request->user()
            ->orders()
            ->withCount('items')
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('store/orders/index', [
            'orders' => $orders,
            'statuses' => Order::STATUS_LABELS,
            'paymentMethods' => PaymentMethod::options(),
            'paymentStatuses' => Order::PAYMENT_STATUS_LABELS,
            'downPaymentStatuses' => Order::DOWN_PAYMENT_STATUS_LABELS,
        ]);
    }

    /**
     * Show a single order belonging to the customer.
     */
    public function show(Order $order): Response
    {
        abort_if($order->customer_id !== auth()->id(), 403);

        $order->load(['items', 'promoCode']);

        return Inertia::render('store/orders/show', [
            'order' => $order,
            'statuses' => Order::STATUS_LABELS,
            'paymentMethods' => PaymentMethod::options(),
            'paymentStatuses' => Order::PAYMENT_STATUS_LABELS,
            'downPaymentStatuses' => Order::DOWN_PAYMENT_STATUS_LABELS,
        ]);
    }

    /**
     * Cancel a pending order and return its stock to inventory.
     */
    public function cancel(Order $order): RedirectResponse
    {
        abort_if($order->customer_id !== auth()->id(), 403);

        if ($order->status !== Order::STATUS_PENDING) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('shop.order_only_pending_cancel'),
            ]);

            return back();
        }

        $order->load('items.product');

        DB::transaction(function () use ($order): void {
            foreach ($order->items as $item) {
                $product = $item->product;

                if ($product && $product->status === Product::STATUS_READY) {
                    $product->increment('stock', $item->quantity);
                }
            }

            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'payment_status' => $order->payment_status === Order::PAYMENT_STATUS_PAID
                    ? Order::PAYMENT_STATUS_REFUNDED
                    : $order->payment_status,
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('shop.order_cancelled'),
        ]);

        return back();
    }
}
