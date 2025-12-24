<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Only load L5-Swagger in local/development environment
        if ($this->app->environment('local')) {
            $this->app->register(\L5Swagger\L5SwaggerServiceProvider::class);
        }
    }

    public function boot(): void
    {
        //
    }
}

