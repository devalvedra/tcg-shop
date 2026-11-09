<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCustomerAddressRequest;
use App\Http\Requests\Admin\UpdateCustomerAddressRequest;
use App\Models\Address;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class CustomerAddressController extends Controller
{
    /**
     * Add a shipping address to the given customer account.
     */
    public function store(StoreCustomerAddressRequest $request, User $customer): RedirectResponse
    {
        abort_unless($customer->isCustomer(), 404);

        $address = $customer->addresses()->create([
            ...$request->validated(),
            'is_default' => false,
        ]);

        if ((bool) $request->boolean('is_default') || $customer->addresses()->count() === 1) {
            $this->setDefault($customer, $address);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.address_added')]);

        return back();
    }

    /**
     * Update one of the customer's addresses.
     */
    public function update(UpdateCustomerAddressRequest $request, User $customer, Address $address): RedirectResponse
    {
        abort_unless($customer->isCustomer(), 404);
        abort_unless($address->user_id === $customer->id, 404);

        $data = $request->validated();
        $wantsDefault = (bool) $request->boolean('is_default');

        // The checkbox only promotes; a customer always keeps a default.
        unset($data['is_default']);
        $address->update($data);

        if ($wantsDefault) {
            $this->setDefault($customer, $address);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.address_updated')]);

        return back();
    }

    /**
     * Set one of the customer's addresses as their default.
     */
    public function default(User $customer, Address $address): RedirectResponse
    {
        abort_unless($customer->isCustomer(), 404);
        abort_unless($address->user_id === $customer->id, 404);

        $this->setDefault($customer, $address);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.default_address_updated')]);

        return back();
    }

    /**
     * Delete one of the customer's addresses.
     *
     * Removing the default address promotes the most recently added one so
     * the customer is never left without a default.
     */
    public function destroy(User $customer, Address $address): RedirectResponse
    {
        abort_unless($customer->isCustomer(), 404);
        abort_unless($address->user_id === $customer->id, 404);

        $wasDefault = (bool) $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $next = $customer->addresses()
                ->orderByDesc('id')
                ->first();

            if ($next) {
                $this->setDefault($customer, $next);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.address_deleted')]);

        return back();
    }

    /**
     * Make the given address the only default address for its customer.
     */
    private function setDefault(User $customer, Address $address): void
    {
        $customer->addresses()->whereKeyNot($address->id)->update(['is_default' => false]);
        $address->update(['is_default' => true]);
    }
}
