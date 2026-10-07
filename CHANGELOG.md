# Changelog

All notable changes to TCG Shop are documented in this file. The current
release version lives in `config/app.php` (`APP_VERSION`) and is shown in
the admin sidebar footer.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Released]

## [1.0.0] - 2026-10-07

- Adding rich text editor to product description.
- Bug fixes.

## [0.1.0] - 2026-10-07

### Admin

- New Packing report (Report menu): product lines from active orders with
  Product, Order date, User, Quantity, and Address columns, product search
  filter, and Excel export.
- Selling products report: multi-option order status filter.
- Orders list: payment status filter; paid status is now Unpaid / DP / Paid
  (down-payment status removed).
- Product form: down payment and YouTube link fields, General Description
  autofill from settings, drag-to-reorder images, 2 MB per-image limit with
  total-size guard and friendly oversized-upload error, square previews.
- Product detail: status, down payment, YouTube link, image gallery with
  lightbox, and a "Go to store's product" button opening the storefront.
- Payment methods: account name field; description, instructions, and sort
  order removed; Active / Not active status select.
- Settings: general description, order cancellation window (enable + hours),
  optional store name/logo branding rules, admin password change with strong
  password validation.
- Customer detail: verify button with confirmation alert for unverified
  customers.

### Storefront

- Product detail: square images with scrollable thumbnails, slide arrows,
  embedded YouTube video (mobile shows it above the description), price
  hidden for guests, product-defined down payments shown as text.
- Home and catalog show two products per row on mobile; taller mobile
  banners with touch swipe and a resettable auto-advance timer.
- Cart blocks mixing ready and pre-order items.
- Checkout: add-address modal that auto-selects the new address; WhatsApp
  order preview (with order number) moved to the confirmation page.
- Order detail: wider layout, mobile-friendly action buttons, customer can
  change payment status while the order is open, editable notes, payment
  account details with copy button, WhatsApp button, printable PDF invoice
  (logo, translated, currency-formatted) with a matching admin button.
- Order numbers use the `G-YYYYMMDD-HHMMxx` format and appear in detail URLs.
- Stock decrements on checkout (and restores on cancel) for ready and
  pre-order products.
- Rich text product descriptions (and general description) with sanitized
  HTML rendering.
- Registration, admin, and profile password changes share one strong rule
  (min 8 chars, upper/lowercase, numbers, symbols) with a single message.

### Platform

- Multi-stage Dockerfile (PHP 8.4 + Apache) with entrypoint handling ports,
  migrations, seeding flags, storage linking, and config caching.
- Render Blueprint (`render.yaml`) for Docker + PostgreSQL deployments.

## [0.0.2]

- Customer verification flow (pending accounts, admin approval).
- Address book with Indonesian regions (provinces, cities, districts,
  subdistricts) seeded from CSV files.
- Pre-orders with customer-chosen down payments.
- Promo codes with limits and expiry.
- Payment methods with per-method instructions.
- Reports: selling products, customer buying, customer orders, total sales.
- Settings: store info, logo, WhatsApp number, shipping rules, language
  (EN/ID) and currency (USD/IDR).

## [0.0.1]

- Initial release: catalog, cart, checkout with WhatsApp confirmation, order
  history, customer accounts, and admin product/order/customer management.
