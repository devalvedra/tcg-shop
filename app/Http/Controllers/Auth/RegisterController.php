<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
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
     * Register a new customer account and sign them in.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255', Rule::unique(User::class)],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            ...$validated,
            'role' => User::ROLE_CUSTOMER,
        ]);

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->route('home');
    }
}
