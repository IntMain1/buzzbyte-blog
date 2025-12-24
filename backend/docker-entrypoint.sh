#!/bin/sh
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
while ! php -r "try { new PDO('mysql:host=mysql;dbname=buzzbyte', 'buzzbyte', 'secret'); echo 'ok'; } catch (Exception \$e) { exit(1); }" 2>/dev/null; do
    sleep 1
done
echo "MySQL is ready!"

# Only run migrations if RUN_MIGRATIONS is set to true
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force
    
    # Create storage link if not exists
    php artisan storage:link 2>/dev/null || true
    
    echo "Migrations complete!"
else
    # Wait for migrations to be complete by checking for a key table
    echo "Waiting for migrations to complete..."
    while ! php -r "try { \$pdo = new PDO('mysql:host=mysql;dbname=buzzbyte', 'buzzbyte', 'secret'); \$pdo->query('SELECT 1 FROM posts LIMIT 1'); echo 'ok'; } catch (Exception \$e) { exit(1); }" 2>/dev/null; do
        sleep 2
    done
    echo "Migrations verified!"
fi

# Start the application
exec "$@"
