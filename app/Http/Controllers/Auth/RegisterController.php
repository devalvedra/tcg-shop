<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ShopSetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    /**
     * Show the customer registration form.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Show the page telling a new customer their account awaits verification.
     */
    public function pending(): Response
    {
        return Inertia::render('auth/pending-verification');
    }

    /**
     * Register a new customer account.
     *
     * When verification is required the account is created as pending and the
     * customer is asked to wait for an admin to verify it before logging in.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255', Rule::unique(User::class)],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $verificationRequired = filter_var(
            ShopSetting::get('customer_verification', '0'),
            FILTER_VALIDATE_BOOLEAN,
        );

        $user = User::create([
            ...$validated,
            'role' => User::ROLE_CUSTOMER,
            'status' => $verificationRequired
                ? User::STATUS_PENDING
                : User::STATUS_VERIFIED,
        ]);

        if ($user->isPendingVerification()) {
            return redirect()->route('register.pending');
        }

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->route('home');
    }
}
