<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ShopSetting;
use App\Services\Cart;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    /**
     * Show a filterable list of purchasable products.
     */
    public function index(Request $request): Response
    {
        $sort = (string) $request->input('sort', 'newest');

        $query = Product::query()
            ->with('images')
            ->whereIn('status', [Product::STATUS_READY, Product::STATUS_PRE_ORDER])
            ->when(in_array($request->input('status'), [Product::STATUS_READY, Product::STATUS_PRE_ORDER], true), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('category', $request->input('category'));
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search'));

                $query->where('name', 'like', "%{$search}%");
            });

        $query = match ($sort) {
            'price-asc' => $query->orderByRaw('COALESCE(sell_price, price) ASC'),
            'price-desc' => $query->orderByRaw('COALESCE(sell_price, price) DESC'),
            default => $query->orderByDesc('created_at'),
        };

        $products = $query->paginate(12)->withQueryString();

        return Inertia::render('store/catalog', [
            'products' => $products,
            'filters' => $request->only(['category', 'search', 'sort', 'status']),
            'categories' => ProductCategory::options(),
        ]);
    }

    /**
     * Show a single product.
     */
    public function show(Product $product, Cart $cart): Response
    {
        abort_if($product->status === Product::STATUS_UNAVAILABLE, 404);

        $product->load('images');

        $recommended = Product::query()
            ->with('images')
            ->where('id', '!=', $product->id)
            ->where('category', $product->category)
            ->whereIn('status', [Product::STATUS_READY, Product::STATUS_PRE_ORDER])
            ->orderByDesc('created_at')
            ->limit(4)
            ->get();

        return Inertia::render('store/products/show', [
            'product' => $product,
            'categories' => ProductCategory::options(),
            'recommended' => $recommended,
            'cartQuantity' => $cart->quantity($product->id),
            'freeShippingThreshold' => (float) (ShopSetting::get('free_shipping_threshold') ?? Order::FREE_SHIPPING_THRESHOLD),
        ]);
    }
}
