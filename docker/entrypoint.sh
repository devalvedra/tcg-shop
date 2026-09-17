#!/bin/sh
set -e

cd /var/www/html

# Create a working .env when one is not injected by the runtime.
if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
fi

# Generate an application key when none is provided (env or .env).
if [ -z "${APP_KEY:-}" ] && ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
    php artisan key:generate --force --no-interaction
fi

mkdir -p \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache/data \
    storage/logs \
    bootstrap/cache

touch database/database.sqlite

# Run the migrations on boot unless explicitly disabled.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force --no-interaction
fi

# Optionally cache the config/routes/views for production.
if [ "${OPTIMIZE:-false}" = "true" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Make sure Apache (www-data) can write to the runtime directories.
chown -R www-data:www-data storage bootstrap/cache database 2>/dev/null || true

exec "$@"
