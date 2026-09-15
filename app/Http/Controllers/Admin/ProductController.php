<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\SortableIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductImage;
use App\Models\ShopSetting;
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
            'generalDescription' => ShopSetting::get('general_description'),
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $product = Product::create(
            $request->safe()->except(['images', 'delete_images', 'image_order']),
        );

        $newImages = $this->storeImages($request, $product);
        $this->applyImageOrder($request, $product, $newImages);

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
            'generalDescription' => ShopSetting::get('general_description'),
        ]);
    }

    /**
     * Update the given product.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $product->update(
            $request->safe()->except(['images', 'delete_images', 'image_order']),
        );

        $this->removeImages($request, $product);

        $newImages = $this->storeImages($request, $product);
        $this->applyImageOrder($request, $product, $newImages);

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
     *
     * @return array<int, ProductImage>
     */
    private function storeImages(Request $request, Product $product): array
    {
        if (! $request->hasFile('images')) {
            return [];
        }

        $maxSort = $product->images()->max('sort_order') ?? -1;

        $created = [];

        foreach ($request->file('images') as $index => $image) {
            $path = $image->store('products', 'public');

            $created[] = $product->images()->create([
                'image' => $path,
                'sort_order' => $maxSort + $index + 1,
            ]);
        }

        return $created;
    }

    /**
     * Apply the submitted image order to the product's images.
     *
     * The order is a list where existing images are referenced as "id:{id}"
     * and freshly uploaded images as "new:{index}" (their position in the
     * uploaded files array).
     *
     * @param  array<int, ProductImage>  $newImages
     */
    private function applyImageOrder(Request $request, Product $product, array $newImages): void
    {
        $order = $request->input('image_order');

        if (! is_array($order) || $order === []) {
            return;
        }

        $position = 0;

        foreach ($order as $entry) {
            $image = null;

            if (is_string($entry) && str_starts_with($entry, 'id:')) {
                $image = $product->images()->whereKey((int) substr($entry, 3))->first();
            } elseif (is_string($entry) && str_starts_with($entry, 'new:')) {
                $image = $newImages[(int) substr($entry, 4)] ?? null;
            }

            if ($image === null) {
                continue;
            }

            $image->update(['sort_order' => $position]);
            $position++;
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
