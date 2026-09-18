<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LoginController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Admin\ProductCategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\PromoCodeController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Store\AddressController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CatalogController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\OrdersController;
use App\Http\Controllers\Store\ProfileController;
use App\Http\Controllers\Store\PromoController;
use App\Http\Controllers\Store\RegionController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('catalog', [CatalogController::class, 'index'])->name('catalog');
Route::get('products/{product:slug}', [CatalogController::class, 'show'])->name('products.show');

Route::get('cart', [CartController::class, 'index'])->name('cart.index');
Route::post('cart/{product}', [CartController::class, 'store'])->name('cart.store');
Route::patch('cart/{product}', [CartController::class, 'update'])->name('cart.update');
Route::delete('cart/{product}', [CartController::class, 'destroy'])->name('cart.destroy');

Route::get('admin', function () {
    $user = auth()->user();

    return redirect()->route($user?->isAdmin() ? 'admin.dashboard' : ($user ? 'home' : 'admin.login'));
})->name('admin');

Route::middleware(['guest'])->group(function () {
    Route::get('register', [RegisterController::class, 'create'])->name('register');
    Route::get('register/pending', [RegisterController::class, 'pending'])->name('register.pending');
    Route::post('register', [RegisterController::class, 'store'])->name('register.store');

    Route::prefix('admin')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('admin.login');
        Route::post('login', [LoginController::class, 'store'])->middleware('throttle:admin-login')->name('admin.login.store');
    });
});

Route::middleware(['auth'])->group(function () {
    Route::get('checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('orders', [OrdersController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrdersController::class, 'show'])->name('orders.show');
    Route::delete('orders/{order}', [OrdersController::class, 'cancel'])->name('orders.cancel');
    Route::put('orders/{order}/notes', [OrdersController::class, 'updateNotes'])->name('orders.notes');
    Route::put('orders/{order}/payment', [OrdersController::class, 'updatePayment'])->name('orders.payment');
    Route::get('orders/{order}/invoice', [OrdersController::class, 'invoice'])->name('orders.invoice');
    Route::get('orders/{order}/confirmation', [CheckoutController::class, 'confirmation'])->name('orders.confirmation');

    Route::get('regions/cities/{province}', [RegionController::class, 'cities'])->name('regions.cities');
    Route::get('regions/districts/{city}', [RegionController::class, 'districts'])->name('regions.districts');
    Route::get('regions/subdistricts/{district}', [RegionController::class, 'subdistricts'])->name('regions.subdistricts');

    Route::get('profile', [ProfileController::class, 'index'])->name('profile.index');

    Route::post('promo/apply', [PromoController::class, 'apply'])->name('promo.apply');
    Route::delete('promo', [PromoController::class, 'remove'])->name('promo.remove');

    Route::post('addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::put('addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
    Route::patch('addresses/{address}/default', [AddressController::class, 'default'])->name('addresses.set-default');
    Route::delete('addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');

    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

        Route::get('reports/selling-products', [ReportController::class, 'sellingProducts'])->name('admin.reports.selling-products');
        Route::get('reports/selling-products/export', [ReportController::class, 'sellingProductsExport'])->name('admin.reports.selling-products.export');
        Route::get('reports/customer-buying', [ReportController::class, 'customerBuying'])->name('admin.reports.customer-buying');
        Route::get('reports/customer-buying/export', [ReportController::class, 'customerBuyingExport'])->name('admin.reports.customer-buying.export');
        Route::get('reports/customer-orders', [ReportController::class, 'customerOrders'])->name('admin.reports.customer-orders');
        Route::get('reports/customer-orders/export', [ReportController::class, 'customerOrdersExport'])->name('admin.reports.customer-orders.export');
        Route::get('reports/total-sales', [ReportController::class, 'totalSales'])->name('admin.reports.total-sales');
        Route::get('reports/total-sales/export', [ReportController::class, 'totalSalesExport'])->name('admin.reports.total-sales.export');
        Route::get('reports/packing', [ReportController::class, 'packing'])->name('admin.reports.packing');
        Route::get('reports/packing/export', [ReportController::class, 'packingExport'])->name('admin.reports.packing.export');
        Route::get('products', [ProductController::class, 'index'])->name('admin.products.index');
        Route::get('products/create', [ProductController::class, 'create'])->name('admin.products.create');
        Route::post('products', [ProductController::class, 'store'])->name('admin.products.store');
        Route::get('products/{product}', [ProductController::class, 'show'])->name('admin.products.show');
        Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('admin.products.edit');
        Route::put('products/{product}', [ProductController::class, 'update'])->name('admin.products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('admin.products.destroy');

        Route::get('categories', [ProductCategoryController::class, 'index'])->name('admin.categories.index');
        Route::get('categories/create', [ProductCategoryController::class, 'create'])->name('admin.categories.create');
        Route::post('categories', [ProductCategoryController::class, 'store'])->name('admin.categories.store');
        Route::get('categories/{product_category}', [ProductCategoryController::class, 'show'])->name('admin.categories.show');
        Route::get('categories/{product_category}/edit', [ProductCategoryController::class, 'edit'])->name('admin.categories.edit');
        Route::put('categories/{product_category}', [ProductCategoryController::class, 'update'])->name('admin.categories.update');
        Route::delete('categories/{product_category}', [ProductCategoryController::class, 'destroy'])->name('admin.categories.destroy');

        Route::get('banners', [BannerController::class, 'index'])->name('admin.banners.index');
        Route::get('banners/create', [BannerController::class, 'create'])->name('admin.banners.create');
        Route::post('banners', [BannerController::class, 'store'])->name('admin.banners.store');
        Route::get('banners/{banner}', [BannerController::class, 'show'])->name('admin.banners.show');
        Route::get('banners/{banner}/edit', [BannerController::class, 'edit'])->name('admin.banners.edit');
        Route::put('banners/{banner}', [BannerController::class, 'update'])->name('admin.banners.update');
        Route::delete('banners/{banner}', [BannerController::class, 'destroy'])->name('admin.banners.destroy');

        Route::get('orders', [OrderController::class, 'index'])->name('admin.orders.index');
        Route::get('orders/export', [OrderController::class, 'export'])->name('admin.orders.export');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('admin.orders.show');
        Route::put('orders/{order}', [OrderController::class, 'update'])->name('admin.orders.update');

        Route::get('customers', [CustomerController::class, 'index'])->name('admin.customers.index');
        Route::get('customers/create', [CustomerController::class, 'create'])->name('admin.customers.create');
        Route::post('customers', [CustomerController::class, 'store'])->name('admin.customers.store');
        Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('admin.customers.show');
        Route::get('customers/{customer}/edit', [CustomerController::class, 'edit'])->name('admin.customers.edit');
        Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('admin.customers.update');
        Route::patch('customers/{customer}/status', [CustomerController::class, 'updateStatus'])->name('admin.customers.status');
        Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('admin.customers.destroy');

        Route::get('promo-codes', [PromoCodeController::class, 'index'])->name('admin.promo-codes.index');
        Route::get('promo-codes/create', [PromoCodeController::class, 'create'])->name('admin.promo-codes.create');
        Route::post('promo-codes', [PromoCodeController::class, 'store'])->name('admin.promo-codes.store');
        Route::get('promo-codes/{promo_code}', [PromoCodeController::class, 'edit'])->name('admin.promo-codes.edit');
        Route::put('promo-codes/{promo_code}', [PromoCodeController::class, 'update'])->name('admin.promo-codes.update');
        Route::delete('promo-codes/{promo_code}', [PromoCodeController::class, 'destroy'])->name('admin.promo-codes.destroy');

        Route::get('payment-methods', [PaymentMethodController::class, 'index'])->name('admin.payment-methods.index');
        Route::get('payment-methods/create', [PaymentMethodController::class, 'create'])->name('admin.payment-methods.create');
        Route::post('payment-methods', [PaymentMethodController::class, 'store'])->name('admin.payment-methods.store');
        Route::get('payment-methods/{payment_method}', [PaymentMethodController::class, 'edit'])->name('admin.payment-methods.edit');
        Route::put('payment-methods/{payment_method}', [PaymentMethodController::class, 'update'])->name('admin.payment-methods.update');
        Route::delete('payment-methods/{payment_method}', [PaymentMethodController::class, 'destroy'])->name('admin.payment-methods.destroy');

        Route::get('settings', [SettingsController::class, 'index'])->name('admin.settings.index');
        Route::put('settings', [SettingsController::class, 'update'])->name('admin.settings.update');
    });
});

require __DIR__.'/settings.php';
