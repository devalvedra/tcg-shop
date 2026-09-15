<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\SortableIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePaymentMethodRequest;
use App\Http\Requests\Admin\UpdatePaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    use SortableIndex;

    /**
     * Show a paginated list of payment methods.
     */
    public function index(Request $request): Response
    {
        $paymentMethods = PaymentMethod::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search'));

                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('is_active', $request->input('status') === 'active');
            });

        $paymentMethods = $this->applySort($request, $paymentMethods, [
            'name' => 'name',
            'code' => 'code',
            'status' => 'is_active',
        ]) ?? $paymentMethods->orderBy('name');

        $paymentMethods = $paymentMethods->paginate(10)->withQueryString();

        return Inertia::render('admin/payment-methods/index', [
            'paymentMethods' => $paymentMethods,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form to create a new payment method.
     */
    public function create(): Response
    {
        return Inertia::render('admin/payment-methods/create');
    }

    /**
     * Store a newly created payment method.
     */
    public function store(StorePaymentMethodRequest $request): RedirectResponse
    {
        PaymentMethod::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.payment_method_created')]);

        return to_route('admin.payment-methods.index');
    }

    /**
     * Show the form to edit an existing payment method.
     */
    public function edit(PaymentMethod $paymentMethod): Response
    {
        return Inertia::render('admin/payment-methods/edit', [
            'paymentMethod' => $paymentMethod,
        ]);
    }

    /**
     * Update the given payment method.
     */
    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.payment_method_updated')]);

        return to_route('admin.payment-methods.index');
    }

    /**
     * Delete the given payment method.
     */
    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.payment_method_deleted')]);

        return to_route('admin.payment-methods.index');
    }
}
