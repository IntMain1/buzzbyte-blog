<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the expired posts deletion job to run every hour
// Uses onOneServer() to prevent duplicate runs in multi-server environments
Schedule::command('posts:delete-expired')
    ->hourly()
    ->onOneServer()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/scheduler.log'));
