<?php

namespace App\Jobs;

use App\Models\Post;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Job to delete expired posts (older than 24 hours)
 * Runs via scheduler and processes in chunks for memory efficiency
 */
class DeleteExpiredPostsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $deletedCount = 0;

        // Process in chunks to prevent memory issues with large datasets
        Post::expired()
            ->chunk(100, function ($posts) use (&$deletedCount) {
                foreach ($posts as $post) {
                    // Clean up cover image if exists
                    if ($post->cover_image) {
                        Storage::disk('public')->delete($post->cover_image);
                    }

                    // Soft delete the post
                    $post->delete();
                    $deletedCount++;
                }
            });

        Log::info("DeleteExpiredPostsJob completed: {$deletedCount} posts deleted.");
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('DeleteExpiredPostsJob failed: ' . $exception->getMessage());
    }
}
