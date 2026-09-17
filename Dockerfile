# syntax=docker/dockerfile:1

###############################################################################
# Build stage
#
# Installs PHP + Node tooling, the Composer dependencies and compiles the
# frontend. Node is required alongside PHP because the Wayfinder Vite plugin
# shells out to `php artisan wayfinder:generate` while building the assets.
###############################################################################
FROM php:8.3-cli AS build

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        curl \
        ca-certificates \
        gnupg \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libzip-dev \
        libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" gd zip mbstring bcmath exif \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies first so this layer is cached.
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-interaction \
        --no-scripts \
        --prefer-dist \
        --optimize-autoloader \
        --no-progress

# Install the Node dependencies next so this layer is cached too.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Copy the application and compile the assets.
COPY . .

RUN export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')" \
    && composer dump-autoload --no-dev --optimize --no-interaction \
    && npm run build \
    && rm -rf node_modules

###############################################################################
# Runtime stage: Apache with mod_php serving Laravel's public/ directory.
###############################################################################
FROM php:8.3-apache AS app

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libzip-dev \
        libonig-dev \
        libxml2-dev \
        libsqlite3-dev \
        libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        gd zip pdo pdo_sqlite pdo_mysql pdo_pgsql pgsql mbstring bcmath exif opcache \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

# Serve the application from Laravel's public directory and allow .htaccess.
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
    && sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf /etc/apache2/sites-available/*.conf

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint \
    && sed -i 's/\r$//' /usr/local/bin/entrypoint

WORKDIR /var/www/html

COPY --from=build /var/www/html /var/www/html

RUN mkdir -p \
        storage/framework/sessions \
        storage/framework/views \
        storage/framework/cache/data \
        storage/logs \
        bootstrap/cache \
    && touch database/database.sqlite \
    && chown -R www-data:www-data storage bootstrap/cache database

EXPOSE 80

ENTRYPOINT ["entrypoint"]
CMD ["apache2-foreground"]
