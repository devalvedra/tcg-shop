---
paths:
  - 'resources/js/**'
---

# Js

## i18n: use t() with English keys from lang/{locale}.json
UI strings are translated via `t('...')` imported from `@/lib/i18n` (module function, NOT a hook, safe at module scope if called at render time). Keys are the EXACT English source strings; Indonesian lives in lang/id.json. Add new supported locales to `HandleInertiaRequests::LOCALES` and validate the `locale` setting. Breadcrumb titles and server label maps (statuses, months, payment methods) are translated at render time via `t(item.title)` / `t(statuses[...])` — never call `t()` at module top-level for label arrays.

## Use shared formatCurrency/currencySymbol from @/lib/currency
Shop currency is a setting ('usd' or 'idr'), validated in UpdateSettingsRequest, shared to the frontend as `page.props.currency` (see HandleInertiaRequests). Always format money with `formatCurrency(value)` and use `currencySymbol()` from `@/lib/currency` — never define a local `Intl.NumberFormat` with a hardcoded currency. Currency-aware form labels use keys like `Price ({symbol})`.
