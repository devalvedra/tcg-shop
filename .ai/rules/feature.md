---
paths:
  - 'tests/Feature/**'
---

# Feature

## `dashboard` route does not exist (pre-existing test failures)
There is no route named `dashboard`. Admin access is named `admin.dashboard` and `EnsureUserIsAdmin` redirects there. A handful of tests (DashboardTest, and the "customers cannot access admin" tests) still call `route('dashboard')` and fail with "Route [dashboard] not defined". These 14 failures pre-date current work; fix the tests/middleware rather than adding a duplicate route blindly.
