<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $phone
 * @property string|null $username
 * @property string $role
 * @property string $status
 * @property string|null $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Address> $addresses
 */
#[Fillable(['name', 'phone', 'username', 'role', 'status', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The role assigned to administrators.
     */
    public const string ROLE_ADMIN = 'admin';

    /**
     * The role assigned to customers.
     */
    public const string ROLE_CUSTOMER = 'customer';

    /**
     * The status of an account that has been verified.
     */
    public const string STATUS_VERIFIED = 'verified';

    /**
     * The status of a customer account waiting for admin verification.
     */
    public const string STATUS_PENDING = 'pending';

    /**
     * @var array<string, string>
     */
    public const array STATUS_LABELS = [
        self::STATUS_VERIFIED => 'Verified',
        self::STATUS_PENDING => 'Waiting for verification',
    ];

    /**
     * The default password assigned to newly created customer accounts.
     */
    public const string DEFAULT_CUSTOMER_PASSWORD = 'password';

    /**
     * Determine whether the user is an administrator.
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Determine whether the user is a customer.
     */
    public function isCustomer(): bool
    {
        return $this->role === self::ROLE_CUSTOMER;
    }

    /**
     * Determine whether the account is verified.
     */
    public function isVerified(): bool
    {
        return $this->role === self::ROLE_ADMIN
            || $this->status === self::STATUS_VERIFIED;
    }

    /**
     * Determine whether the account is waiting for verification.
     */
    public function isPendingVerification(): bool
    {
        return $this->role === self::ROLE_CUSTOMER
            && $this->status === self::STATUS_PENDING;
    }

    /**
     * The orders placed by this customer.
     *
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    /**
     * The shipping addresses belonging to this customer.
     *
     * @return HasMany<Address, $this>
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    /**
     * The customer's default shipping address, if one exists.
     */
    public function defaultAddress(): ?Address
    {
        return $this->addresses()->where('is_default', true)->first();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
