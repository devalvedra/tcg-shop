---
paths:
  - app/Services/Cart.php
---

# Services

## Cart stores per-item down payments separately from quantity
The cart session has two keys: `cart.items` (product id => quantity) and `cart.down_payments` (product id => float). `Cart::items()` always prices at the full sell price (`sell_price ?? price`) and exposes a separate `down_payment` field (only for pre-order items, clamped to be strictly below the item subtotal). `Cart::downPayment()` sums item down payments. Down payments are customer-entered, optional, and `0 <= dp < subtotal` — never a price override. CartController validates the `< subtotal` bound on add/update; pre-order stock is not decremented at checkout.
