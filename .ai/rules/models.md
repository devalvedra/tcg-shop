---
paths:
  - app/Models/Product.php
  - app/Models/ShopSetting.php
  - app/Models/Order.php
---

# Models

## Wayfinder regen must use --with-form
Always regenerate wayfinder with `php artisan wayfinder:generate --with-form` (or `npm run build`). A bare `wayfinder:generate` strips `.form` variants from routes and breaks `types:check` across all pages.

## Product slugs and sell-price-only display
Product routes bind by slug (`products/{product:slug}`); `showProduct` wayfinder calls pass `product.slug`. `price` = buy/internal cost and is never displayed in the storefront (only `sell_price ?? price`). Slug auto-generates in a `saving` hook (empty slug or name change), deduped with `-2`, `-3`.

## ShopSetting maps to `settings` table
ShopSetting extends Model but must declare `protected $table = 'settings';` — otherwise Laravel infers `shop_settings` from the class name and the app errors with "no such table: shop_settings".

## Order down_payment + down_payment_status semantics
Orders carry `down_payment` (sum of customer-entered down payments across cart items, set at checkout via `Cart::downPayment()`) and `down_payment_status` (unpaid/paid). `down_payment_status` defaults to unpaid and is marked paid by the admin from the order show page (same flow as payment_status). Orders with down_payment 0 show a dash in lists. Note: `products` has NO down_payment column — down payments are per-cart-item, not per-product.

## Product categories are DB-backed, referenced by slug
products.category stores the slug of a row in product_categories (NO foreign key — deliberate). Product::CATEGORIES/CATEGORY_LABELS constants were removed; admin/controllers source the list from ProductCategory::options() (slug => name) and Product exposes a category_name accessor (appended, falls back to a headline of the slug). The slug must stay stable: ProductCategory only auto-generates a slug when blank, never on name change, or product filters/links break.
