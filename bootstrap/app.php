<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Support\CloudflareProxies;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust Cloudflare's edge network (or TRUSTED_PROXIES) so HTTPS
        // detection, client IPs, and forwarded hosts resolve correctly.
        $middleware->trustProxies(at: CloudflareProxies::trusted());

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
        ]);

        $middleware->redirectUsersTo(fn () => route('home'));

        $middleware->redirectGuestsTo(function (Request $request) {
            return $request->is('admin') || $request->is('admin/*')
                ? route('admin.login')
                : route('login');
        });

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            // Send visitors to the storefront home page when no route
            // matches. Requests that matched a route but aborted (for
            // example an unavailable product) keep the regular 404 page.
            if ($request->expectsJson() || $request->route() !== null) {
                return null;
            }

            return redirect()->route('home');
        });

        $exceptions->render(function (PostTooLargeException $e, Request $request) {
            $message = 'The uploaded files are too large. Please reduce the total size and try again.';

            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 413);
            }

            $referer = $request->headers->get('referer') ?: '/';
            $separator = str_contains($referer, '?') ? '&' : '?';

            return redirect()->to($referer.$separator.'upload_error=1');
        });
    })->create();
