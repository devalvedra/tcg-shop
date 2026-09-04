---
paths:
  - 'resources/js/actions/**'
---

# Actions

## Regenerate action modules via vite build for form variants
`php artisan wayfinder:generate` writes route/action modules WITHOUT `.form()` variants. The `@laravel/vite-plugin-wayfinder` plugin emits form variants during `npm run build` / `npm run dev`. After changing controllers/routes, run `npm run build` so `*.form()` in Inertia <Form> usage type-checks.
