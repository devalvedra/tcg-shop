<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\StoreAddressRequest;
use App\Http\Requests\Store\UpdateAddressRequest;
use App\Models\Address;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AddressController extends Controller
{
    /**
     * Add a shipping address for the authenticated customer.
     */
    public function store(StoreAddressRequest $request): RedirectResponse
    {
        $user = $request->user();

        $address = $user->addresses()->create([
            ...$request->validated(),
            'is_default' => false,
        ]);

        if ((bool) $request->boolean('is_default') || $user->addresses()->count() === 1) {
            $this->setDefault($address);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.address_added')]);

        return back();
    }

    /**
     * Update a shipping address belonging to the authenticated customer.
     */
    public function update(UpdateAddressRequest $request, Address $address): RedirectResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $address->update($request->validated());

        if ($request->boolean('is_default')) {
            $this->setDefault($address);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.address_updated')]);

        return back();
    }

    /**
     * Set a shipping address as the customer's default.
     */
    public function default(Request $request, Address $address): RedirectResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $this->setDefault($address);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.default_address_updated')]);

        return back();
    }

    /**
     * Delete a shipping address belonging to the authenticated customer.
     */
    public function destroy(Request $request, Address $address): RedirectResponse
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $wasDefault = $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $next = $request->user()
                ->addresses()
                ->orderByDesc('id')
                ->first();

            if ($next) {
                $this->setDefault($next);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.address_deleted')]);

        return back();
    }

    /**
     * Make the given address the only default address for its customer.
     */
    private function setDefault(Address $address): void
    {
        $address->user->addresses()->whereKeyNot($address->id)->update(['is_default' => false]);
        $address->update(['is_default' => true]);
    }
}
