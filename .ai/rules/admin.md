---
paths:
  - 'app/Http/Controllers/Admin/**'
---

# Admin

## Rate-limiting via throttle middleware + named limiter
Laravel 13 has no ThrottlesLogins trait. Rate-limit login POSTs with `->middleware('throttle:<name>')` and register `RateLimiter::for('<name>', ...)` in FortifyServiceProvider::configureRateLimiting. In tests, the throttle key is md5('<limiterName>'.implode('|', [$username, '127.0.0.1'])), so seed the limiter with RateLimiter::increment(md5('admin-login'.implode('|', [$user->username, '127.0.0.1'])), amount: 5) before asserting 429.
