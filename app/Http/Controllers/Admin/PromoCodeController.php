<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\SortableIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePromoCodeRequest;
use App\Http\Requests\Admin\UpdatePromoCodeRequest;
use App\Models\PromoCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromoCodeController extends Controller
{
    use SortableIndex;

    /**
     * Show a paginated list of promo codes.
     */
    public function index(Request $request): Response
    {
        $promoCodes = PromoCode::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search'));

                $query->where(function ($query) use ($search) {
                    $query->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('is_active', $request->input('status') === 'active');
            });

        $promoCodes = $this->applySort($request, $promoCodes, [
            'code' => 'code',
            'name' => 'name',
            'uses' => 'uses_count',
        ]) ?? $promoCodes->orderByDesc('created_at');

        $promoCodes = $promoCodes->paginate(10)->withQueryString();

        return Inertia::render('admin/promo-codes/index', [
            'promoCodes' => $promoCodes,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form to create a new promo code.
     */
    public function create(): Response
    {
        return Inertia::render('admin/promo-codes/create');
    }

    /**
     * Store a newly created promo code.
     */
    public function store(StorePromoCodeRequest $request): RedirectResponse
    {
        PromoCode::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.promo_code_created')]);

        return to_route('admin.promo-codes.index');
    }

    /**
     * Show the form to edit an existing promo code.
     */
    public function edit(PromoCode $promoCode): Response
    {
        return Inertia::render('admin/promo-codes/edit', [
            'promoCode' => $promoCode,
        ]);
    }

    /**
     * Update the given promo code.
     */
    public function update(UpdatePromoCodeRequest $request, PromoCode $promoCode): RedirectResponse
    {
        $promoCode->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.promo_code_updated')]);

        return to_route('admin.promo-codes.index');
    }

    /**
     * Delete the given promo code.
     */
    public function destroy(PromoCode $promoCode): RedirectResponse
    {
        $promoCode->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.promo_code_deleted')]);

        return to_route('admin.promo-codes.index');
    }
}
