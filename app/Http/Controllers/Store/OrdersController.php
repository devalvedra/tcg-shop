<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\ShopSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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
            'paymentMethodDetails' => $this->paymentMethodDetails($order),
            'whatsappNumber' => ShopSetting::get('whatsapp_number') ?: null,
            'cancelOrder' => $this->cancelOrderConfig($order),
        ]);
    }

    /**
     * Update the notes attached to a customer's order.
     */
    public function updateNotes(Request $request, Order $order): RedirectResponse
    {
        abort_if($order->customer_id !== auth()->id(), 403);

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $order->update(['notes' => $validated['notes'] ?? null]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('shop.order_notes_updated'),
        ]);

        return back();
    }

    /**
     * Update the payment status of a customer's order.
     *
     * Customers may only change it while the order is still open (not
     * cancelled or completed).
     */
    public function updatePayment(Request $request, Order $order): RedirectResponse
    {
        abort_if($order->customer_id !== auth()->id(), 403);

        if (in_array($order->status, [Order::STATUS_CANCELLED, Order::STATUS_COMPLETED], true)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('shop.order_payment_locked'),
            ]);

            return back();
        }

        $validated = $request->validate([
            'payment_status' => ['required', Rule::in(Order::PAYMENT_STATUSES)],
        ]);

        $order->update(['payment_status' => $validated['payment_status']]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('shop.order_payment_updated'),
        ]);

        return back();
    }

    /**
     * Render a printable invoice for the given order.
     */
    public function invoice(Order $order): HttpResponse
    {
        abort_if($order->customer_id !== auth()->id() && ! auth()->user()?->isAdmin(), 403);

        $order->load(['items', 'customer', 'promoCode']);

        $settings = ShopSetting::allSettings();

        $locale = $settings['locale'] ?? config('app.locale', 'en');
        app()->setLocale(in_array($locale, ['en', 'id'], true) ? $locale : 'en');

        $pdf = Pdf::loadView('invoice', [
            'order' => $order,
            'paymentMethod' => $this->paymentMethodDetails($order),
            'store' => [
                'name' => $settings['store_name'] ?? config('app.name'),
                'logo_path' => $this->storeLogoPath($settings['store_logo'] ?? null),
                'email' => $settings['store_email'] ?? null,
                'phone' => $settings['store_phone'] ?? null,
                'address' => $settings['store_address'] ?? null,
            ],
        ]);

        return $pdf->download("invoice-{$order->order_number}.pdf");
    }

    /**
     * Resolve the absolute path of the store logo for the PDF invoice.
     *
     * Only raster formats are used so the logo reliably renders in Dompdf.
     */
    private function storeLogoPath(?string $logo): ?string
    {
        if (! $logo) {
            return null;
        }

        $extension = strtolower(pathinfo($logo, PATHINFO_EXTENSION));

        if (! in_array($extension, ['jpg', 'jpeg', 'png', 'gif'], true)) {
            return null;
        }

        return Storage::disk('public')->exists($logo)
            ? Storage::disk('public')->path($logo)
            : null;
    }

    /**
     * Cancel a pending order and return its stock to inventory.
     */
    public function cancel(Order $order): RedirectResponse
    {
        abort_if($order->customer_id !== auth()->id(), 403);

        $config = $this->cancelOrderConfig($order);

        if (! $config['canCancel']) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('shop.order_cannot_cancel'),
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
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('shop.order_cancelled'),
        ]);

        return back();
    }

    /**
     * The payment method record used to pay for the given order, if any.
     *
     * @return array{name: string, account_name: string|null, code: string}|null
     */
    private function paymentMethodDetails(Order $order): ?array
    {
        if (! $order->payment_method) {
            return null;
        }

        $method = PaymentMethod::where('code', $order->payment_method)->first();

        if (! $method) {
            return null;
        }

        return [
            'name' => $method->name,
            'account_name' => $method->account_name,
            'code' => $method->code,
        ];
    }

    /**
     * The cancel-order configuration for the given order.
     *
     * @return array{enabled: bool, hours: int, canCancel: bool}
     */
    private function cancelOrderConfig(Order $order): array
    {
        $enabled = filter_var(ShopSetting::get('cancel_order_enabled', '1'), FILTER_VALIDATE_BOOLEAN);
        $hours = (int) (ShopSetting::get('cancel_order_hours', '1') ?? 1);

        $withinWindow = $order->created_at !== null
            && $order->created_at->gt(now()->subHours($hours));

        $canCancel = $enabled
            && $order->status === Order::STATUS_PENDING
            && $withinWindow;

        return [
            'enabled' => $enabled,
            'hours' => $hours,
            'canCancel' => $canCancel,
        ];
    }
}
