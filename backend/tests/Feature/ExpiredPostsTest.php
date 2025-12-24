<?php

namespace Tests\Feature;

use App\Jobs\DeleteExpiredPostsJob;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Tests for the DeleteExpiredPostsJob
 * Verifies that posts older than 24 hours are soft-deleted correctly
 */
class ExpiredPostsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that expired posts (older than 24 hours) are deleted.
     */
    public function test_expired_posts_are_deleted(): void
    {
        Storage::fake('public');
        
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        
        // Create an expired post (25 hours old)
        $expiredPost = Post::factory()->for($user)->create([
            'created_at' => now()->subHours(25),
        ]);
        $expiredPost->tags()->attach($tag);

        // Run the job
        (new DeleteExpiredPostsJob())->handle();

        // Assert the post is soft-deleted
        $this->assertSoftDeleted('posts', ['id' => $expiredPost->id]);
    }

    /**
     * Test that non-expired posts (less than 24 hours old) are not deleted.
     */
    public function test_non_expired_posts_are_not_deleted(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        
        // Create a fresh post (1 hour old)
        $freshPost = Post::factory()->for($user)->create([
            'created_at' => now()->subHours(1),
        ]);
        $freshPost->tags()->attach($tag);

        // Run the job
        (new DeleteExpiredPostsJob())->handle();

        // Assert the post still exists and is NOT soft-deleted
        $this->assertDatabaseHas('posts', [
            'id' => $freshPost->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * Test that a post exactly at 24 hours is deleted.
     */
    public function test_post_at_exactly_24_hours_is_deleted(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        
        // Create a post exactly 24 hours old
        $post = Post::factory()->for($user)->create([
            'created_at' => now()->subHours(24),
        ]);
        $post->tags()->attach($tag);

        // Run the job
        (new DeleteExpiredPostsJob())->handle();

        // Assert the post is soft-deleted
        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    /**
     * Test that cover images are cleaned up when posts are deleted.
     */
    public function test_cover_images_are_deleted_with_expired_posts(): void
    {
        Storage::fake('public');
        
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        
        // Create a fake image file
        $imagePath = 'posts/test-image.jpg';
        Storage::disk('public')->put($imagePath, 'fake image content');
        
        // Create an expired post with cover image
        $expiredPost = Post::factory()->for($user)->create([
            'created_at' => now()->subHours(25),
            'cover_image' => $imagePath,
        ]);
        $expiredPost->tags()->attach($tag);

        // Run the job
        (new DeleteExpiredPostsJob())->handle();

        // Assert the image was deleted
        Storage::disk('public')->assertMissing($imagePath);
        
        // Assert the post is soft-deleted
        $this->assertSoftDeleted('posts', ['id' => $expiredPost->id]);
    }

    /**
     * Test that multiple expired posts are deleted in batch.
     */
    public function test_multiple_expired_posts_are_deleted(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        
        // Create 3 expired posts
        $expiredPosts = [];
        for ($i = 0; $i < 3; $i++) {
            $post = Post::factory()->for($user)->create([
                'created_at' => now()->subHours(25 + $i),
            ]);
            $post->tags()->attach($tag);
            $expiredPosts[] = $post;
        }
        
        // Create 2 fresh posts
        $freshPosts = [];
        for ($i = 0; $i < 2; $i++) {
            $post = Post::factory()->for($user)->create([
                'created_at' => now()->subHours(1 + $i),
            ]);
            $post->tags()->attach($tag);
            $freshPosts[] = $post;
        }

        // Run the job
        (new DeleteExpiredPostsJob())->handle();

        // Assert all expired posts are soft-deleted
        foreach ($expiredPosts as $post) {
            $this->assertSoftDeleted('posts', ['id' => $post->id]);
        }
        
        // Assert fresh posts still exist
        foreach ($freshPosts as $post) {
            $this->assertDatabaseHas('posts', [
                'id' => $post->id,
                'deleted_at' => null,
            ]);
        }
    }
}
