<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $order_number
 * @property int $customer_id
 * @property string $status
 * @property string|null $payment_method
 * @property string $payment_status
 * @property string $subtotal
 * @property string $down_payment
 * @property string $shipping_fee
 * @property string $discount
 * @property string $total
 * @property string|null $notes
 * @property string|null $shipping_address
 * @property string|null $shipping_city
 * @property string|null $shipping_province
 * @property string|null $shipping_district
 * @property string|null $shipping_subdistrict
 * @property string|null $shipping_zip
 * @property string|null $receiver_name
 * @property int|null $promo_code_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $customer
 * @property-read PromoCode|null $promoCode
 * @property-read Collection<int, OrderItem> $items
 */
#[Fillable(['customer_id', 'status', 'payment_method', 'payment_status', 'subtotal', 'down_payment', 'shipping_fee', 'discount', 'total', 'notes', 'shipping_address', 'shipping_city', 'shipping_province', 'shipping_district', 'shipping_subdistrict', 'shipping_zip', 'receiver_name', 'promo_code_id'])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    public const string STATUS_PENDING = 'pending';

    public const string STATUS_CONFIRMED = 'confirmed';

    public const string STATUS_PROCESSING = 'processing';

    public const string STATUS_SHIPPED = 'shipped';

    public const string STATUS_COMPLETED = 'completed';

    public const string STATUS_CANCELLED = 'cancelled';

    /**
     * The order statuses offered by the shop.
     *
     * @var array<int, string>
     */
    public const array STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
        self::STATUS_PROCESSING,
        self::STATUS_SHIPPED,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
    ];

    /**
     * @var array<string, string>
     */
    public const array STATUS_LABELS = [
        'pending' => 'Pending',
        'confirmed' => 'Confirmed',
        'processing' => 'Processing',
        'shipped' => 'Shipped',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];

    /**
     * The payment methods accepted by the shop.
     *
     * @var array<int, string>
     */
    public const array PAYMENT_METHODS = [
        '09171234567',
        '09181234567',
        '1234-5678-9012',
        'cod',
    ];

    /**
     * @var array<string, string>
     */
    public const array PAYMENT_METHOD_LABELS = [
        '09171234567' => 'GCash',
        '09181234567' => 'Maya',
        '1234-5678-9012' => 'Bank Transfer',
        'cod' => 'Cash on Delivery',
    ];

    public const float SHIPPING_FEE = 5.0;

    public const float FREE_SHIPPING_THRESHOLD = 100.0;

    public const string PAYMENT_STATUS_UNPAID = 'unpaid';

    public const string PAYMENT_STATUS_DP = 'dp';

    public const string PAYMENT_STATUS_PAID = 'paid';

    /**
     * @var array<int, string>
     */
    public const array PAYMENT_STATUSES = [
        self::PAYMENT_STATUS_UNPAID,
        self::PAYMENT_STATUS_DP,
        self::PAYMENT_STATUS_PAID,
    ];

    /**
     * @var array<string, string>
     */
    public const array PAYMENT_STATUS_LABELS = [
        'unpaid' => 'Unpaid',
        'dp' => 'Down payment paid',
        'paid' => 'Paid',
    ];

    /**
     * The customer who placed this order.
     *
     * @return BelongsTo<User, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * The items attached to this order.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * The promo code used for this order, if any.
     *
     * @return BelongsTo<PromoCode, $this>
     */
    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }

    /**
     * Boot the model and assign a unique order number on creation.
     */
    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
        });
    }

    /**
     * Generate a random order number that is not already in use.
     */
    protected static function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-'.Str::upper(Str::random(12));
        } while (static::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    /**
     * Determine whether this order includes a down payment.
     */
    public function hasDownPayment(): bool
    {
        return (float) $this->down_payment > 0;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'down_payment' => 'decimal:2',
            'shipping_fee' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }
}
