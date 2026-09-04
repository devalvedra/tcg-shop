<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\ShopSetting;
use Illuminate\Support\Collection;

class Cart
{
    private const string SESSION_KEY = 'cart.items';

    private const string DOWN_PAYMENTS_KEY = 'cart.down_payments';

    /**
     * Get the raw cart contents.
     *
     * @return array<int, int> product id => quantity
     */
    private function contents(): array
    {
        $contents = session(self::SESSION_KEY, []);

        return is_array($contents) ? $contents : [];
    }

    /**
     * Get the raw down payments.
     *
     * @return array<int, float> product id => down payment
     */
    private function downPayments(): array
    {
        $downPayments = session(self::DOWN_PAYMENTS_KEY, []);

        return is_array($downPayments) ? $downPayments : [];
    }

    /**
     * Get the down payment stored for a product, if any.
     */
    private function downPaymentFor(int $productId): float
    {
        $stored = (float) ($this->downPayments()[$productId] ?? 0);

        return round(max(0, $stored), 2);
    }

    /**
     * Get the cart items hydrated with their products.
     *
     * @return Collection<int, array{product: Product, quantity: int, unit_price: float, subtotal: float, down_payment: float}>
     */
    public function items(): Collection
    {
        $contents = $this->contents();

        if ($contents === []) {
            return collect();
        }

        $products = Product::with('images')->whereKey(array_keys($contents))->get()->keyBy('id');

        return $products
            ->map(function (Product $product) use ($contents): array {
                $unitPrice = (float) ($product->sell_price ?? $product->price);
                $quantity = (int) $contents[$product->id];
                $subtotal = round($unitPrice * $quantity, 2);

                $downPayment = $product->status === Product::STATUS_PRE_ORDER
                    ? $this->downPaymentFor($product->id)
                    : 0.0;

                $clampedDownPayment = round(
                    min((float) $downPayment, max(0, $subtotal - 0.01)),
                    2,
                );

                return [
                    'product' => $product,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    'down_payment' => $clampedDownPayment,
                ];
            })
            ->values();
    }

    public function add(Product $product, int $quantity = 1, ?float $downPayment = null): void
    {
        $contents = $this->contents();
        $newQuantity = ($contents[$product->id] ?? 0) + $quantity;
        $contents[$product->id] = $newQuantity;

        $this->put($contents);
        $this->setDownPayment($product, $downPayment, $newQuantity);
    }

    public function update(Product $product, ?int $quantity = null, ?float $downPayment = null): void
    {
        $contents = $this->contents();

        if ($quantity !== null && $quantity < 1) {
            unset($contents[$product->id]);
            $this->put($contents);
            $this->forgetDownPayment($product->id);

            return;
        }

        $newQuantity = $quantity ?? ($contents[$product->id] ?? 1);
        $contents[$product->id] = $newQuantity;

        $this->put($contents);
        $this->setDownPayment($product, $downPayment, $newQuantity);
    }

    public function remove(Product $product): void
    {
        $contents = $this->contents();
        unset($contents[$product->id]);

        $this->put($contents);
        $this->forgetDownPayment($product->id);
    }

    public function clear(): void
    {
        session()->forget([self::SESSION_KEY, self::DOWN_PAYMENTS_KEY]);
    }

    public function quantity(int $productId): int
    {
        return (int) ($this->contents()[$productId] ?? 0);
    }

    public function count(): int
    {
        return (int) array_sum($this->contents());
    }

    public function isEmpty(): bool
    {
        return $this->contents() === [];
    }

    /**
     * Bring the cart back in line with the current product stock.
     *
     * Lines whose product can no longer be ordered are removed, and quantities
     * that exceed the available stock are lowered to the maximum orderable
     * amount. Down payments for adjusted lines are clamped accordingly.
     *
     * @return array{removed: list<string>, clamped: bool}
     */
    public function reconcile(): array
    {
        $removed = [];
        $clamped = false;

        foreach ($this->contents() as $productId => $quantity) {
            $product = Product::find($productId);

            if (! $product) {
                $removed[] = 'Item';
                $this->drop($productId);

                continue;
            }

            if (! $this->isOrderable($product) || (int) $product->stock < 1) {
                $removed[] = $product->name;
                $this->remove($product);

                continue;
            }

            $max = (int) $product->stock;

            if ($quantity > $max) {
                $this->update($product, $max);
                $clamped = true;
            }
        }

        return ['removed' => $removed, 'clamped' => $clamped];
    }

    public function subtotal(): float
    {
        return round((float) $this->items()->sum('subtotal'), 2);
    }

    public function downPayment(): float
    {
        return round((float) $this->items()->sum('down_payment'), 2);
    }

    public function shippingFee(): float
    {
        $subtotal = $this->subtotal();

        if ($subtotal <= 0) {
            return 0;
        }

        $threshold = (float) (ShopSetting::get('free_shipping_threshold') ?? Order::FREE_SHIPPING_THRESHOLD);
        $fee = (float) (ShopSetting::get('shipping_fee') ?? Order::SHIPPING_FEE);

        return $subtotal >= $threshold ? 0.0 : $fee;
    }

    public function total(): float
    {
        return round($this->subtotal() + $this->shippingFee(), 2);
    }

    /**
     * Store (or clear) the down payment for a pre-order item.
     *
     * The amount is always clamped to be lower than the item subtotal so the
     * invariant "down payment < subtotal" holds even if a quantity or price
     * changes after the amount was chosen.
     */
    private function setDownPayment(Product $product, ?float $downPayment, int $quantity): void
    {
        $downPayments = $this->downPayments();

        if ($product->status !== Product::STATUS_PRE_ORDER) {
            $this->forgetDownPayment($product->id);

            return;
        }

        $max = max(0, round(((float) ($product->sell_price ?? $product->price)) * $quantity - 0.01, 2));
        $amount = $downPayment !== null
            ? (float) $downPayment
            : $this->downPaymentFor($product->id);

        $downPayments[$product->id] = min(max(0, round($amount, 2)), $max);
        $this->putDownPayments($downPayments);
    }

    /**
     * Remove the down payment for a product.
     */
    private function forgetDownPayment(int $productId): void
    {
        $downPayments = $this->downPayments();
        unset($downPayments[$productId]);

        $this->putDownPayments($downPayments);
    }

    /**
     * Determine whether a product can currently be ordered by this customer.
     */
    private function isOrderable(Product $product): bool
    {
        if ($product->status === Product::STATUS_READY) {
            return true;
        }

        if ($product->status === Product::STATUS_PRE_ORDER) {
            return $product->isPreOrderWindowOpen();
        }

        return false;
    }

    /**
     * Remove a product from the cart by id.
     */
    private function drop(int $productId): void
    {
        $contents = $this->contents();
        unset($contents[$productId]);

        $this->put($contents);
        $this->forgetDownPayment($productId);
    }

    /**
     * @param  array<int, int>  $contents
     */
    private function put(array $contents): void
    {
        session([self::SESSION_KEY => $contents]);
    }

    /**
     * @param  array<int, float>  $downPayments
     */
    private function putDownPayments(array $downPayments): void
    {
        session([self::DOWN_PAYMENTS_KEY => $downPayments]);
    }
}
