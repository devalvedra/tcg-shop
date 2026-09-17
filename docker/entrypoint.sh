#!/bin/sh
set -e

cd /var/www/html

# Render (and most PaaS) inject the port the service must listen on. Serve on
# both 80 and the injected port so routing works either way.
PORT="${PORT:-80}"
if [ "$PORT" != "80" ]; then
    sed -ri "s#^Listen 80#Listen 80\nListen ${PORT}#" /etc/apache2/ports.conf
    sed -ri "s#<VirtualHost \*:80>#<VirtualHost *:80 *:${PORT}>#" /etc/apache2/sites-available/000-default.conf
fi
echo "Apache listening on ports 80 and ${PORT}"

# Only create a local .env when no runtime environment is supplied
# (e.g. plain `docker run`). On Render the configuration comes from env vars.
if [ ! -f .env ] && [ -z "${APP_KEY:-}" ] && [ -f .env.example ]; then
    cp .env.example .env
fi

# Generate an application key when none is provided.
if [ -z "${APP_KEY:-}" ] && ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
    php artisan key:generate --force --no-interaction
fi

# Derive the public URL from Render's built-in variable when not supplied.
if [ -z "${APP_URL:-}" ] && [ -n "${RENDER_EXTERNAL_URL:-}" ]; then
    export APP_URL="${RENDER_EXTERNAL_URL}"
fi

mkdir -p \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache/data \
    storage/logs \
    bootstrap/cache

touch database/database.sqlite

# Link the public storage so uploaded images are served from /storage.
# Only runs when LINK_STORAGE=true. Drop a stale/broken link first so an
# old image never 404s.
if [ "${LINK_STORAGE:-false}" = "true" ]; then
    if [ -L public/storage ] && [ ! -e public/storage ]; then
        rm public/storage
    fi
    if [ ! -e public/storage ]; then
        php artisan storage:link
    fi
fi

# Run the migrations on boot unless explicitly disabled. Retry while the
# database is still coming up.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    attempt=0
    until php artisan migrate --force --no-interaction; do
        attempt=$((attempt + 1))
        if [ "$attempt" -ge 5 ]; then
            echo "Database migrations failed after ${attempt} attempts." >&2
            exit 1
        fi
        echo "Database not ready, retrying in 3s (${attempt}/5)..."
        sleep 3
    done
fi

# Load the Indonesian region data (provinces/cities/districts/subdistricts)
# when requested. Safe to run repeatedly.
if [ "${SEED_REGIONS:-false}" = "true" ]; then
    php artisan db:seed --class=RegionSeeder --force --no-interaction
fi

# Create the default admin/customer accounts when requested. Safe to run
# repeatedly (users are matched by phone), but note it resets the default
# accounts' passwords back to the seeder defaults, so enable only once.
if [ "${SEED_USERS:-false}" = "true" ]; then
    php artisan db:seed --class=UserSeeder --force --no-interaction
fi

# Cache config and views in production for faster responses.
if [ "${OPTIMIZE:-false}" = "true" ]; then
    php artisan config:cache
    php artisan view:cache
fi

# Make sure Apache (www-data) can write to the runtime directories.
chown -R www-data:www-data storage bootstrap/cache database 2>/dev/null || true

exec "$@"
