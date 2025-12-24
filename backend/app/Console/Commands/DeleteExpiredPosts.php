<?php

namespace App\Console\Commands;

use App\Models\Post;
use Illuminate\Console\Command;

/**
 * DeleteExpiredPosts - Scheduled Artisan Command
 * 
 * Core feature of the ephemeral blog concept:
 * - Runs hourly via Laravel Scheduler (defined in routes/console.php)
 * - Finds posts older than 24 hours using Post::expired() scope
 * - Force deletes them (bypasses soft delete for permanent removal)
 * 
 * Schedule: hourly
 * Command: php artisan posts:delete-expired
 * 
 * @author Omar Tarek
 */
class DeleteExpiredPosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'posts:delete-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete posts that are older than 24 hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = Post::expired()->count();
        
        if ($count === 0) {
            $this->info('No expired posts found.');
            return 0;
        }

        // Force delete expired posts (they're already soft-deleted conceptually by being expired)
        Post::expired()->forceDelete();

        $this->info("Successfully deleted {$count} expired posts.");
        
        return 0;
    }
}
