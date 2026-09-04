<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the authenticated customer's storefront profile.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('store/profile', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'addresses' => $request->user()
                ->addresses()
                ->orderByDesc('is_default')
                ->orderByDesc('id')
                ->get(),
        ]);
    }
}
