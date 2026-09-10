<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\SortableIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCustomerRequest;
use App\Http\Requests\Admin\UpdateCustomerRequest;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    use SortableIndex;

    /**
     * Show a paginated list of customer accounts.
     */
    public function index(Request $request): Response
    {
        $customers = User::query()
            ->where('role', User::ROLE_CUSTOMER)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search'));

                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });

        $customers = $this->applySort($request, $customers, [
            'name' => 'name',
            'phone' => 'phone',
            'added' => 'created_at',
        ]) ?? $customers->orderByDesc('created_at');

        $customers = $customers->paginate(10)->withQueryString();

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'sort', 'direction']),
            'customerStatuses' => User::STATUS_LABELS,
        ]);
    }

    /**
     * Show the form to create a new customer account.
     */
    public function create(): Response
    {
        return Inertia::render('admin/customers/create');
    }

    /**
     * Store a newly created customer account.
     *
     * Accounts created by an admin are always verified.
     */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $customer = User::create([
            ...$request->validated(),
            'role' => User::ROLE_CUSTOMER,
            'status' => User::STATUS_VERIFIED,
            'password' => User::DEFAULT_CUSTOMER_PASSWORD,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.customer_created')]);

        return to_route('admin.customers.show', $customer);
    }

    /**
     * Show the detail page for an existing customer.
     */
    public function show(User $customer): Response
    {
        abort_unless($customer->isCustomer(), 404);

        $orders = $customer->orders()
            ->withCount('items')
            ->latest()
            ->limit(10)
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

        return Inertia::render('admin/customers/show', [
            'customer' => $customer,
            'addresses' => $customer->addresses()
                ->orderByDesc('is_default')
                ->orderByDesc('id')
                ->get(),
            'orders' => $orders,
            'statuses' => Order::STATUS_LABELS,
            'customerStatuses' => User::STATUS_LABELS,
        ]);
    }

    /**
     * Show the form to edit an existing customer account.
     */
    public function edit(User $customer): Response
    {
        abort_unless($customer->isCustomer(), 404);

        return Inertia::render('admin/customers/edit', [
            'customer' => $customer,
            'addresses' => $customer->addresses()
                ->orderByDesc('is_default')
                ->orderByDesc('id')
                ->get(),
            'customerStatuses' => User::STATUS_LABELS,
        ]);
    }

    /**
     * Update the verification status of a customer account.
     */
    public function updateStatus(Request $request, User $customer): RedirectResponse
    {
        abort_unless($customer->isCustomer(), 404);

        $status = $request->input('status');

        abort_unless(in_array($status, [User::STATUS_VERIFIED, User::STATUS_PENDING], true), 422);

        $customer->update(['status' => $status]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.customer_status_updated')]);

        return back();
    }

    /**
     * Update the given customer account.
     */
    public function update(UpdateCustomerRequest $request, User $customer): RedirectResponse
    {
        abort_unless($customer->isCustomer(), 404);

        $customer->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.customer_updated')]);

        return to_route('admin.customers.show', $customer);
    }

    /**
     * Delete the given customer account.
     */
    public function destroy(User $customer): RedirectResponse
    {
        abort_unless($customer->isCustomer(), 404);

        $customer->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.customer_deleted')]);

        return to_route('admin.customers.index');
    }
}
