<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    /**
     * Selling product report: units sold per product, most bought first.
     */
    public function sellingProducts(Request $request): Response
    {
        return Inertia::render('admin/reports/selling-products', [
            'rows' => $this->sellingProductsRows($request),
            'filters' => $this->filters($request, ['search']),
        ]);
    }

    public function sellingProductsExport(Request $request): BinaryFileResponse
    {
        $rows = $this->sellingProductsRows($request);

        return $this->excelDownload('selling-product-report', [
            ['Rank', 'Product', 'Category', 'Created date', 'Stock', 'Units sold', 'Revenue'],
            ...collect($rows)->map(fn ($row, $index) => [
                $index + 1,
                $row['product_name'],
                $row['category'],
                $row['created_at'],
                (int) $row['stock'],
                (int) $row['units_sold'],
                (float) $row['total_revenue'],
            ])->all(),
        ]);
    }

    /**
     * Customer buying report: quantity bought and money spent per customer.
     */
    public function customerBuying(Request $request): Response
    {
        return Inertia::render('admin/reports/customer-buying', [
            'rows' => $this->customerBuyingRows($request),
            'filters' => $this->filters($request, ['customer']),
        ]);
    }

    public function customerBuyingExport(Request $request): BinaryFileResponse
    {
        $rows = $this->customerBuyingRows($request);

        return $this->excelDownload('customer-buying-report', [
            ['Rank', 'Customer', 'Phone', 'Products bought', 'Money spent'],
            ...collect($rows)->map(fn ($row, $index) => [
                $index + 1,
                $row['name'],
                $row['phone'],
                (int) $row['products_bought'],
                (float) $row['money_spent'],
            ])->all(),
        ]);
    }

    /**
     * Customer order report: one row per product line bought, grouped by
     * customer then date, scoped to the current month by default.
     */
    public function customerOrders(Request $request): Response
    {
        [$from, $to] = $this->customerMonthRange($request);

        return Inertia::render('admin/reports/customer-orders', [
            'rows' => $this->customerOrderRows($request),
            'filters' => [
                'customer' => $request->input('customer') ?: null,
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
        ]);
    }

    public function customerOrdersExport(Request $request): BinaryFileResponse
    {
        $rows = $this->customerOrderRows($request);

        return $this->excelDownload('customer-order-report', [
            ['Customer', 'Date', 'Order number', 'Product', 'Quantity'],
            ...collect($rows)->map(fn ($row) => [
                $row['customer_name'],
                $row['date'],
                $row['order_number'],
                $row['product_name'],
                (int) $row['quantity'],
            ])->all(),
        ]);
    }

    /**
     * Total sales report: month/date subtotals across the visible window.
     */
    public function totalSales(Request $request): Response
    {
        return Inertia::render('admin/reports/total-sales', [
            'rows' => $this->totalSalesRows($request),
            'filters' => $this->filters($request),
        ]);
    }

    public function totalSalesExport(Request $request): BinaryFileResponse
    {
        $rows = $this->totalSalesRows($request);

        $export = [];
        foreach ($rows as $row) {
            if ($row['type'] === 'order') {
                $export[] = [$row['month'], $row['date'], $row['order_number'], (float) $row['total']];
            } elseif ($row['type'] === 'date_total') {
                $export[] = ['', $row['date'].' (Subtotal)', '', (float) $row['total']];
            } elseif ($row['type'] === 'month_total') {
                $export[] = [$row['month'].' (Subtotal)', '', '', (float) $row['total']];
            } else {
                $export[] = ['Total of all months', '', '', (float) $row['total']];
            }
        }

        return $this->excelDownload('total-sales-report', [
            ['Month', 'Date', 'Order id', 'Total'],
            ...$export,
        ]);
    }

    /**
     * Build the selling products rows.
     *
     * @return array<int, array{product_name: string, category: string, created_at: string|null, stock: int, units_sold: int, total_revenue: float}>
     */
    private function sellingProductsRows(Request $request): array
    {
        $query = OrderItem::query()
            ->leftJoin('products', 'order_items.product_id', '=', 'products.id')
            ->whereHas('order', function ($query) use ($request) {
                $query->whereNot('status', Order::STATUS_CANCELLED);

                if ($request->filled('from')) {
                    $query->whereDate('created_at', '>=', $request->input('from'));
                }

                if ($request->filled('to')) {
                    $query->whereDate('created_at', '<=', $request->input('to'));
                }
            })
            ->when($request->filled('search'), function (Builder $query) use ($request) {
                $search = trim($request->string('search'));

                $query->where('order_items.product_name', 'like', "%{$search}%");
            })
            ->select('order_items.product_name')
            ->selectRaw("COALESCE(MAX(products.category), '') as category")
            ->selectRaw('MAX(products.created_at) as created_at')
            ->selectRaw('COALESCE(MAX(products.stock), 0) as stock')
            ->selectRaw('SUM(order_items.quantity) as units_sold')
            ->selectRaw('SUM(order_items.subtotal) as total_revenue')
            ->groupBy('order_items.product_name')
            ->orderByDesc('units_sold')
            ->orderByDesc('total_revenue');

        return $query->get()->map(function (OrderItem $row) {
            $createdAt = $row->getAttribute('created_at');

            return [
                'product_name' => $row->product_name,
                'category' => (string) $row->getAttribute('category'),
                'created_at' => $createdAt ? Carbon::parse((string) $createdAt)->format('d/m/Y') : null,
                'stock' => (int) $row->getAttribute('stock'),
                'units_sold' => (int) $row->getAttribute('units_sold'),
                'total_revenue' => (float) $row->getAttribute('total_revenue'),
            ];
        })->values()->all();
    }

    /**
     * Build the customer buying rows.
     *
     * @return array<int, array{id: int, name: string, phone: string|null, products_bought: int, money_spent: float}>
     */
    private function customerBuyingRows(Request $request): array
    {
        $query = User::query()
            ->where('role', User::ROLE_CUSTOMER)
            ->when($request->filled('customer'), function (Builder $query) use ($request) {
                $name = trim($request->string('customer'));

                $query->where('name', 'like', "%{$name}%");
            })
            ->addSelect(['money_spent' => Order::query()
                ->selectRaw('COALESCE(SUM(total), 0)')
                ->whereColumn('customer_id', 'users.id')
                ->whereNot('status', Order::STATUS_CANCELLED)
                ->when($request->filled('from'), fn (Builder $q) => $q->whereDate('created_at', '>=', $request->input('from')))
                ->when($request->filled('to'), fn (Builder $q) => $q->whereDate('created_at', '<=', $request->input('to')))])
            ->addSelect(['products_bought' => OrderItem::query()
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->selectRaw('COALESCE(SUM(order_items.quantity), 0)')
                ->where('orders.status', '!=', Order::STATUS_CANCELLED)
                ->whereColumn('orders.customer_id', 'users.id')
                ->when($request->filled('from'), fn (Builder $q) => $q->whereDate('orders.created_at', '>=', $request->input('from')))
                ->when($request->filled('to'), fn (Builder $q) => $q->whereDate('orders.created_at', '<=', $request->input('to')))])
            ->orderByDesc('money_spent');

        return $query->get()
            ->filter(fn (User $user) => (float) $user->getAttribute('money_spent') > 0 || (int) $user->getAttribute('products_bought') > 0)
            ->values()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'products_bought' => (int) $user->getAttribute('products_bought'),
                'money_spent' => (float) $user->getAttribute('money_spent'),
            ])
            ->all();
    }

    /**
     * Build the customer order rows (one row per product line), grouped by
     * customer then date.
     *
     * @return array<int, array{customer_name: string, created_at: string, date: string, order_id: int, order_number: string, product_name: string, quantity: int}>
     */
    private function customerOrderRows(Request $request): array
    {
        [$from, $to] = $this->customerMonthRange($request);

        $orders = Order::query()
            ->with(['customer:id,name', 'items'])
            ->whereNot('status', Order::STATUS_CANCELLED)
            ->when($request->filled('customer'), function (Builder $query) use ($request) {
                $name = trim($request->string('customer'));

                $query->whereHas('customer', fn (Builder $q) => $q->where('name', 'like', "%{$name}%"));
            })
            ->whereBetween('created_at', [$from, $to])
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        $rows = [];

        foreach ($orders as $order) {
            $date = $order->created_at;

            foreach ($order->items as $item) {
                $rows[] = [
                    'customer_name' => $order->customer->name,
                    'created_at' => $order->created_at->toIso8601String(),
                    'date' => $date ? $date->format('d/m/Y') : '',
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'product_name' => (string) $item->product_name,
                    'quantity' => (int) $item->quantity,
                ];
            }
        }

        usort($rows, function (array $a, array $b): int {
            return [$a['customer_name'], $a['created_at'], $a['order_number']]
                <=> [$b['customer_name'], $b['created_at'], $b['order_number']];
        });

        return $rows;
    }

    /**
     * The date range for the customer order report; defaults to the current
     * month.
     *
     * @return array{CarbonInterface, CarbonInterface}
     */
    private function customerMonthRange(Request $request): array
    {
        $from = $request->filled('from')
            ? Carbon::parse($request->input('from'))->startOfDay()
            : now()->startOfMonth();

        $to = $request->filled('to')
            ? Carbon::parse($request->input('to'))->endOfDay()
            : now()->endOfMonth();

        return [$from, $to];
    }

    /**
     * Build the total sales rows with date and month subtotals.
     *
     * @return array<int, array<string, mixed>>
     */
    private function totalSalesRows(Request $request): array
    {
        [$from, $to] = $this->resolvedRange($request);
        $rows = [];
        $grandTotal = 0;

        $months = $this->monthCursor($from, $to);

        foreach ($months as $month) {
            $monthFrom = $month['start'];
            $monthTo = $month['end'];

            $orders = Order::query()
                ->whereNot('status', Order::STATUS_CANCELLED)
                ->whereBetween('created_at', [$monthFrom, $monthTo])
                ->orderBy('created_at')
                ->orderBy('id')
                ->get(['id', 'order_number', 'created_at', 'total']);

            if ($orders->isEmpty()) {
                continue;
            }

            $monthTotal = 0;

            foreach ($orders->groupBy(fn (Order $order) => $order->created_at->toDateString()) as $day => $dayOrders) {
                $dayTotal = 0;

                foreach ($dayOrders as $order) {
                    $monthTotal += (float) $order->total;
                    $dayTotal += (float) $order->total;

                    $rows[] = [
                        'type' => 'order',
                        'month' => $month['label'],
                        'date' => Carbon::parse($day)->format('d/m/Y'),
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'total' => round((float) $order->total, 2),
                    ];
                }

                $rows[] = [
                    'type' => 'date_total',
                    'month' => $month['label'],
                    'date' => Carbon::parse($day)->format('d/m/Y'),
                    'total' => round($dayTotal, 2),
                ];
            }

            $rows[] = [
                'type' => 'month_total',
                'month' => $month['label'],
                'date' => null,
                'total' => round($monthTotal, 2),
            ];

            $grandTotal += round($monthTotal, 2);
        }

        if ($rows !== []) {
            $rows[] = [
                'type' => 'grand_total',
                'month' => null,
                'date' => null,
                'total' => round($grandTotal, 2),
            ];
        }

        return $rows;
    }

    /**
     * The effective date range; defaults to the last 12 complete months
     * ending with the current month.
     *
     * @return array{CarbonInterface, CarbonInterface}
     */
    private function resolvedRange(Request $request): array
    {
        $fromInput = $request->input('from');
        $toInput = $request->input('to');

        if ($fromInput || $toInput) {
            $to = $toInput ? Carbon::parse($toInput)->endOfDay() : now()->endOfDay();
            $from = $fromInput
                ? Carbon::parse($fromInput)->startOfDay()
                : $to->copy()->startOfMonth()->subMonths(11)->startOfMonth();

            return [$from, $to];
        }

        return [
            now()->startOfMonth()->subMonths(11),
            now()->endOfMonth(),
        ];
    }

    /**
     * A descending list of month windows between the given dates.
     *
     * @return array<int, array{label: string, start: CarbonInterface, end: CarbonInterface}>
     */
    private function monthCursor(CarbonInterface $from, CarbonInterface $to): array
    {
        $months = [];
        $cursor = $to->copy()->startOfMonth();
        $lower = $from->copy()->startOfMonth();

        while ($cursor->gte($lower) && count($months) < 120) {
            $months[] = [
                'label' => $cursor->format('F Y'),
                'start' => $cursor->copy()->startOfMonth()->max($from),
                'end' => $cursor->copy()->endOfMonth()->min($to),
            ];

            $cursor = $cursor->subMonth();
        }

        return $months;
    }

    /**
     * The active report filters, including any extra named filter.
     *
     * @param  list<string>  $extra
     * @return array<string, string|null>
     */
    private function filters(Request $request, array $extra = []): array
    {
        $values = [
            'from' => $request->input('from') ?: null,
            'to' => $request->input('to') ?: null,
        ];

        foreach ($extra as $key) {
            $values[$key] = $request->input($key) ?: null;
        }

        return $values;
    }

    /**
     * Download the given rows as an Excel (.xlsx) file.
     *
     * @param  array<int, array<int, string|int|float>>  $rows
     */
    private function excelDownload(string $slug, array $rows): BinaryFileResponse
    {
        $spreadsheet = new Spreadsheet();
        $spreadsheet->getActiveSheet()->fromArray($rows, null, 'A1');

        $path = tempnam(sys_get_temp_dir(), 'report-');

        if ($path === false) {
            abort(500);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save($path);

        $filename = $slug.'-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->download($path, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
}
