<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Product;
use App\Models\ProductCategory;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Show the storefront home page.
     */
    public function index(): Response
    {
        $banners = Banner::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $featuredProducts = Product::query()
            ->with('images')
            ->where('status', Product::STATUS_READY)
            ->where('stock', '>=', 1)
            ->orderByDesc('created_at')
            ->limit(8)
            ->get();

        $preOrderProducts = Product::query()
            ->with('images')
            ->where('status', Product::STATUS_PRE_ORDER)
            ->where('stock', '>=', 1)
            ->orderByDesc('created_at')
            ->get();

        $categories = ProductCategory::query()
            ->withCount(['products' => function ($query) {
                $query->whereIn('status', [Product::STATUS_READY, Product::STATUS_PRE_ORDER]);
            }])
            ->orderBy('name')
            ->get()
            ->map(fn (ProductCategory $category): array => [
                'key' => $category->slug,
                'label' => $category->name,
                'count' => $category->products_count,
            ])
            ->values();

        return Inertia::render('store/index', [
            'banners' => $banners,
            'featuredProducts' => $featuredProducts,
            'preOrderProducts' => $preOrderProducts,
            'categories' => $categories,
        ]);
    }
}
