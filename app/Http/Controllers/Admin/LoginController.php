<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    /**
     * Show the admin login screen.
     */
    public function create(): Response
    {
        return Inertia::render('auth/admin-login');
    }

    /**
     * Handle an incoming admin login request.
     */
    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember')) && $request->user()->isAdmin()) {
            $request->session()->regenerate();

            return redirect()->intended(route('admin.dashboard'));
        }

        Auth::logout();

        throw ValidationException::withMessages([
            'username' => trans('auth.failed'),
        ]);
    }
}
