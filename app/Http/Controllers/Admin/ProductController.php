<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\SortableIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    use SortableIndex;

    /**
     * Show a paginated list of products.
     */
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->with('images')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search'));

                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('category', $request->input('category'));
            });

        $products = $this->applySort($request, $products, [
            'name' => 'name',
            'category' => 'category',
            'price' => fn (Builder $query, string $direction) => $query->orderByRaw(
                "COALESCE(sell_price, price) {$direction}",
            ),
            'stock' => 'stock',
            'status' => 'status',
        ]) ?? $products->orderByDesc('created_at');

        $products = $products->paginate(10)->withQueryString();

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'status', 'category', 'sort', 'direction']),
            'categories' => ProductCategory::options(),
            'statuses' => Product::STATUS_LABELS,
        ]);
    }

    /**
     * Show the form to create a new product.
     */
    public function create(): Response
    {
        return Inertia::render('admin/products/create', [
            'categories' => ProductCategory::options(),
            'statuses' => Product::STATUS_LABELS,
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $product = Product::create(
            $request->safe()->except(['images', 'delete_images']),
        );

        $this->storeImages($request, $product);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.product_created')]);

        return to_route('admin.products.show', $product);
    }

    /**
     * Show the detail page for an existing product.
     */
    public function show(Product $product): Response
    {
        $product->load('images');

        return Inertia::render('admin/products/show', [
            'product' => $product,
            'categories' => ProductCategory::options(),
            'statuses' => Product::STATUS_LABELS,
        ]);
    }

    /**
     * Show the form to edit an existing product.
     */
    public function edit(Product $product): Response
    {
        $product->load('images');

        return Inertia::render('admin/products/edit', [
            'product' => $product,
            'categories' => ProductCategory::options(),
            'statuses' => Product::STATUS_LABELS,
        ]);
    }

    /**
     * Update the given product.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $product->update(
            $request->safe()->except(['images', 'delete_images']),
        );

        $this->removeImages($request, $product);
        $this->storeImages($request, $product);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.product_updated')]);

        return to_route('admin.products.show', $product);
    }

    /**
     * Delete the given product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image);
        }

        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.product_deleted')]);

        return to_route('admin.products.index');
    }

    /**
     * Persist the uploaded images for the given product.
     */
    private function storeImages(Request $request, Product $product): void
    {
        if (! $request->hasFile('images')) {
            return;
        }

        $maxSort = $product->images()->max('sort_order') ?? -1;

        foreach ($request->file('images') as $index => $image) {
            $path = $image->store('products', 'public');

            $product->images()->create([
                'image' => $path,
                'sort_order' => $maxSort + $index + 1,
            ]);
        }
    }

    /**
     * Delete the images marked for removal on the given product.
     */
    private function removeImages(Request $request, Product $product): void
    {
        $deleteIds = $request->input('delete_images', []);

        if (empty($deleteIds)) {
            return;
        }

        $product->images()
            ->whereIn('id', $deleteIds)
            ->get()
            ->each(function ($image) {
                Storage::disk('public')->delete($image->image);
                $image->delete();
            });
    }
}
