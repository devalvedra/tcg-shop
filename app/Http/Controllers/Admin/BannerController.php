<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\SortableIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBannerRequest;
use App\Http\Requests\Admin\UpdateBannerRequest;
use App\Models\Banner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    use SortableIndex;

    /**
     * Show a paginated list of banners.
     */
    public function index(Request $request): Response
    {
        $banners = Banner::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search'));

                $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('is_active', $request->input('status') === 'active');
            });

        $banners = $this->applySort($request, $banners, [
            'title' => 'title',
            'sort_order' => 'sort_order',
            'link' => 'link_url',
            'status' => 'is_active',
        ]) ?? $banners->orderBy('sort_order')->orderByDesc('created_at');

        $banners = $banners->paginate(10)->withQueryString();

        return Inertia::render('admin/banners/index', [
            'banners' => $banners,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form to create a new banner.
     */
    public function create(): Response
    {
        return Inertia::render('admin/banners/create');
    }

    /**
     * Store a newly created banner.
     */
    public function store(StoreBannerRequest $request): RedirectResponse
    {
        $banner = Banner::create($request->safe()->except(['image']));

        if ($request->hasFile('image')) {
            $banner->update(['image' => $request->file('image')->store('banners', 'public')]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.banner_created')]);

        return to_route('admin.banners.show', $banner);
    }

    /**
     * Show the detail page for an existing banner.
     */
    public function show(Banner $banner): Response
    {
        return Inertia::render('admin/banners/show', [
            'banner' => $banner,
        ]);
    }

    /**
     * Show the form to edit an existing banner.
     */
    public function edit(Banner $banner): Response
    {
        return Inertia::render('admin/banners/edit', [
            'banner' => $banner,
        ]);
    }

    /**
     * Update the given banner.
     */
    public function update(UpdateBannerRequest $request, Banner $banner): RedirectResponse
    {
        $banner->update($request->safe()->except(['image']));

        if ($request->hasFile('image')) {
            if ($banner->image) {
                Storage::disk('public')->delete($banner->image);
            }

            $banner->update(['image' => $request->file('image')->store('banners', 'public')]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.banner_updated')]);

        return to_route('admin.banners.show', $banner);
    }

    /**
     * Delete the given banner.
     */
    public function destroy(Banner $banner): RedirectResponse
    {
        if ($banner->image) {
            Storage::disk('public')->delete($banner->image);
        }

        $banner->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.banner_deleted')]);

        return to_route('admin.banners.index');
    }
}
