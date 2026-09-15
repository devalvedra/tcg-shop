<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard with live shop analytics for admins or a
     * customer-facing overview for regular users.
     */
    public function index(Request $request): Response
    {
        return $request->user()->isAdmin()
            ? $this->adminDashboard($request)
            : $this->customerDashboard($request);
    }

    /**
     * Build the admin analytics dashboard, scoped to the selected period.
     */
    private function adminDashboard(Request $request): Response
    {
        $month = (int) $request->integer('month', now()->month);
        $year = (int) $request->integer('year', now()->year);

        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }

        if ($year < 2000 || $year > now()->year) {
            $year = now()->year;
        }

        $periodOrders = Order::query()
            ->whereNot('status', Order::STATUS_CANCELLED)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);

        $totalRevenue = (float) (clone $periodOrders)->sum('total');

        $ordersCount = Order::query()
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count();
        $pendingOrders = Order::query()
            ->where('status', Order::STATUS_PENDING)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count();
        $customersCount = User::where('role', User::ROLE_CUSTOMER)->count();
        $unitsInStock = (int) Product::sum('stock');
        $lowStockCount = Product::query()
            ->where('status', Product::STATUS_READY)
            ->where('stock', '<=', 5)
            ->count();

        $lowStock = Product::query()
            ->with('images')
            ->where('status', Product::STATUS_READY)
            ->where('stock', '<=', 5)
            ->orderBy('stock')
            ->limit(5)
            ->get()
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'category' => $product->category,
                'stock' => $product->stock,
                'image' => $product->images->first()?->url,
            ])
            ->values();

        $recentOrders = Order::query()
            ->with('customer:id,name,phone')
            ->withCount('items')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer->name,
                'items_count' => $order->items_count,
                'total' => $order->total,
                'status' => $order->status,
                'created_at' => $order->created_at,
            ])
            ->values();

        $topSellers = OrderItem::query()
            ->whereHas('order', function ($query) use ($year, $month) {
                $query->whereYear('created_at', $year)->whereMonth('created_at', $month);
            })
            ->select('product_name')
            ->selectRaw('SUM(quantity) as total_sold')
            ->selectRaw('SUM(subtotal) as total_revenue')
            ->groupBy('product_name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get()
            ->map(fn (OrderItem $item): array => [
                'product_name' => $item->product_name,
                'total_sold' => (int) $item->getAttribute('total_sold'),
                'total_revenue' => (float) $item->getAttribute('total_revenue'),
            ])
            ->values();

        $daysInMonth = now()->setDate($year, $month, 1)->daysInMonth;
        $dayTotals = Order::query()
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->get(['created_at', 'total', 'status'])
            ->groupBy(fn (Order $order) => (int) $order->created_at->format('d'));

        $salesByDay = collect(range(1, $daysInMonth))
            ->map(function (int $day) use ($dayTotals): array {
                $orders = $dayTotals->get($day, collect());

                return [
                    'day' => $day,
                    'revenue' => round((float) $orders
                        ->reject(fn (Order $order) => $order->status === Order::STATUS_CANCELLED)
                        ->sum('total'), 2),
                    'orders' => $orders->count(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_revenue' => round($totalRevenue, 2),
                'orders_count' => $ordersCount,
                'pending_orders' => $pendingOrders,
                'customers_count' => $customersCount,
                'units_in_stock' => $unitsInStock,
                'low_stock_count' => $lowStockCount,
            ],
            'recentOrders' => $recentOrders,
            'topSellers' => $topSellers,
            'lowStock' => $lowStock,
            'salesByDay' => $salesByDay,
            'statuses' => Order::STATUS_LABELS,
            'filters' => ['month' => $month, 'year' => $year],
            'months' => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            'years' => $this->availableYears(),
        ]);
    }

    /**
     * Build the list of years that contain orders, newest first.
     *
     * @return array<int, int>
     */
    private function availableYears(): array
    {
        $earliest = Order::query()->min('created_at');
        $timestamp = $earliest ? strtotime((string) $earliest) : false;
        $earliestYear = $timestamp ? (int) date('Y', $timestamp) : now()->year;

        return array_reverse(range($earliestYear, now()->year));
    }

    /**
     * Build the customer-facing dashboard overview.
     */
    private function customerDashboard(Request $request): Response
    {
        $user = $request->user();

        $orders = $user->orders()
            ->withCount('items')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'items_count' => $order->items_count,
                'total' => $order->total,
                'status' => $order->status,
                'created_at' => $order->created_at,
            ])
            ->values();

        return Inertia::render('customer/dashboard', [
            'orderCount' => $user->orders()->count(),
            'recentOrders' => $orders,
            'statuses' => Order::STATUS_LABELS,
        ]);
    }
}
