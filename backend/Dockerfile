FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    dos2unix \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Convert line endings and make script executable
RUN dos2unix /var/www/html/docker-entrypoint.sh && chmod +x /var/www/html/docker-entrypoint.sh

# Install PHP dependencies
RUN composer install --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port
EXPOSE 8000

# Use entrypoint script
ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]

# Start PHP built-in server (for development)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
