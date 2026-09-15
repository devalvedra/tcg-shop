<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\SortableIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    use SortableIndex;

    /**
     * Show a paginated list of orders.
     */
    public function index(Request $request): Response
    {
        $orders = $this->filteredOrders($request);

        $orders = $this->applySort($request, $orders, [
            'order' => 'order_number',
            'date' => 'created_at',
            'customer' => fn (Builder $query, string $direction) => $query->orderBy(
                User::select('name')->whereColumn('users.id', 'orders.customer_id'),
                $direction,
            ),
            'items' => 'items_count',
            'total' => 'total',
            'down_payment' => 'down_payment',
            'status' => 'status',
            'paid' => 'payment_status',
        ]) ?? $orders->orderByDesc('created_at');

        $orders = $orders->paginate(10)->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'payment_status', 'customer', 'product', 'from', 'to', 'sort', 'direction']),
            'statuses' => Order::STATUS_LABELS,
            'paymentStatuses' => Order::PAYMENT_STATUS_LABELS,
        ]);
    }

    /**
     * Download the filtered orders as a CSV file.
     */
    public function export(Request $request): StreamedResponse
    {
        $orders = $this->filteredOrders($request)
            ->orderByDesc('created_at')
            ->get();

        $filename = 'orders-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($orders) {
            $stream = fopen('php://output', 'w');

            if (! $stream) {
                return;
            }

            fputcsv($stream, [
                'Order ID',
                'Order Number',
                'Ordered At',
                'Customer Name',
                'Customer Phone',
                'Customer Email',
                'Products',
                'Subtotal',
                'Down Payment',
                'Shipping Fee',
                'Discount',
                'Total',
                'Status',
                'Payment Method',
                'Payment Status',
                'Notes',
            ]);

            foreach ($orders as $order) {
                fputcsv($stream, [
                    $order->id,
                    $order->order_number,
                    $order->created_at?->toDateTimeString(),
                    $order->customer->name,
                    $order->customer->phone,
                    $order->customer->email,
                    $order->items->pluck('product_name')->implode(' | '),
                    (float) $order->subtotal,
                    (float) $order->down_payment,
                    (float) $order->shipping_fee,
                    (float) $order->discount,
                    (float) $order->total,
                    $order->status,
                    $order->payment_method,
                    $order->payment_status,
                    $order->notes,
                ]);
            }

            fclose($stream);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Show the details of a single order.
     */
    public function show(Order $order): Response
    {
        $order->load(['customer', 'items', 'promoCode']);

        return Inertia::render('admin/orders/show', [
            'order' => $order,
            'statuses' => Order::STATUS_LABELS,
            'paymentMethods' => PaymentMethod::options(),
            'paymentStatuses' => Order::PAYMENT_STATUS_LABELS,
        ]);
    }

    /**
     * Update the status of the given order.
     */
    public function update(UpdateOrderRequest $request, Order $order): RedirectResponse
    {
        $order->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.order_updated')]);

        return back();
    }

    /**
     * Apply the supported request filters to an order query.
     *
     * @return Builder<Order>
     */
    private function filteredOrders(Request $request): Builder
    {
        return Order::query()
            ->with(['customer:id,name,phone,email', 'items'])
            ->withCount('items')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search'));

                $query->where(function ($query) use ($search) {
                    $query->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($query) use ($search) {
                            $query->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('items', function ($query) use ($search) {
                            $query->where('product_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('customer'), function ($query) use ($request) {
                $customer = trim($request->string('customer'));

                $query->whereHas('customer', function ($query) use ($customer) {
                    $query->where('name', 'like', "%{$customer}%");
                });
            })
            ->when($request->filled('product'), function ($query) use ($request) {
                $product = trim($request->string('product'));

                $query->whereHas('items', function ($query) use ($product) {
                    $query->where('product_name', 'like', "%{$product}%");
                });
            })
            ->when($request->filled('from'), function ($query) use ($request) {
                $query->whereDate('created_at', '>=', $request->input('from'));
            })
            ->when($request->filled('to'), function ($query) use ($request) {
                $query->whereDate('created_at', '<=', $request->input('to'));
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->when($request->filled('payment_status'), function ($query) use ($request) {
                $query->where('payment_status', $request->input('payment_status'));
            });
    }
}
