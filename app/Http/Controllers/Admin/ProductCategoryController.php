<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\SortableIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductCategoryRequest;
use App\Http\Requests\Admin\UpdateProductCategoryRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    use SortableIndex;

    /**
     * Show a paginated list of product categories.
     */
    public function index(Request $request): Response
    {
        $categories = ProductCategory::query()
            ->withCount(['products' => function ($query) {
                $query->whereIn('status', [Product::STATUS_READY, Product::STATUS_PRE_ORDER]);
            }])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search'));

                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });

        $categories = $this->applySort($request, $categories, [
            'name' => 'name',
            'slug' => 'slug',
            'products' => 'products_count',
        ]) ?? $categories->orderBy('name');

        $categories = $categories->paginate(10)->withQueryString();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form to create a new product category.
     */
    public function create(): Response
    {
        return Inertia::render('admin/categories/create');
    }

    /**
     * Store a newly created product category.
     */
    public function store(StoreProductCategoryRequest $request): RedirectResponse
    {
        $productCategory = ProductCategory::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.category_created')]);

        return to_route('admin.categories.show', $productCategory);
    }

    /**
     * Show the detail page for an existing product category.
     */
    public function show(ProductCategory $productCategory): Response
    {
        $productCategory->loadCount(['products' => function ($query) {
            $query->whereIn('status', [Product::STATUS_READY, Product::STATUS_PRE_ORDER]);
        }]);

        return Inertia::render('admin/categories/show', [
            'category' => $productCategory,
            'productCount' => $productCategory->products_count,
        ]);
    }

    /**
     * Show the form to edit an existing product category.
     */
    public function edit(ProductCategory $productCategory): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => $productCategory,
        ]);
    }

    /**
     * Update the given product category.
     */
    public function update(UpdateProductCategoryRequest $request, ProductCategory $productCategory): RedirectResponse
    {
        $productCategory->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.category_updated')]);

        return to_route('admin.categories.show', $productCategory);
    }

    /**
     * Delete the given product category.
     */
    public function destroy(ProductCategory $productCategory): RedirectResponse
    {
        if ($productCategory->products()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('shop.category_in_use'),
            ]);

            return back();
        }

        $productCategory->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('shop.category_deleted')]);

        return to_route('admin.categories.index');
    }
}
