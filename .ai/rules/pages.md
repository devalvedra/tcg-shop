---
paths:
  - 'resources/js/pages/**'
---

# Pages

## Wayfinder nested-route import convention
Nested route names (e.g. cart.index, orders.show, products.show) are NOT exported from `@/routes`. Import them from their submodule with a local alias: `import { index as cartIndex } from '@/routes/cart'`, `import { show as showOrder } from '@/routes/orders'`. The route helper's URL is `.url(...)`; use `router.patch/delete/post` from `@inertiajs/react` for controlled submissions. Wayfinder modules regenerate on `npm run build` (run it before tsc/build to avoid MISSING_EXPORT errors).
