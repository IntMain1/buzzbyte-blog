<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for Post Like functionality
 */
class LikeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can like a post.
     */
    public function test_user_can_like_post(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        $post = Post::factory()->for($user)->create();
        $post->tags()->attach($tag);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/posts/{$post->id}/like");

        $response->assertStatus(200)
            ->assertJsonPath('liked', true);

        $this->assertDatabaseHas('post_user_likes', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);
    }

    /**
     * Test user can unlike a post (toggle off).
     */
    public function test_user_can_unlike_post(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        $post = Post::factory()->for($user)->create();
        $post->tags()->attach($tag);
        
        // First, like the post
        $post->likes()->attach($user->id);

        // Then toggle to unlike
        $response = $this->actingAs($user, 'sanctum')->postJson("/api/posts/{$post->id}/like");

        $response->assertStatus(200)
            ->assertJsonPath('liked', false);

        $this->assertDatabaseMissing('post_user_likes', [
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);
    }

    /**
     * Test like count is returned correctly.
     */
    public function test_like_count_is_returned(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $tag = Tag::factory()->create();
        $post = Post::factory()->for($user1)->create();
        $post->tags()->attach($tag);
        
        // Both users like the post
        $post->likes()->attach([$user1->id, $user2->id]);

        $response = $this->actingAs($user1, 'sanctum')->postJson("/api/posts/{$post->id}/like");

        // user1 unlikes, now count should be 1
        $response->assertStatus(200)
            ->assertJsonPath('likes_count', 1);
    }

    /**
     * Test user can like another user's post.
     */
    public function test_user_can_like_others_post(): void
    {
        $author = User::factory()->create();
        $viewer = User::factory()->create();
        $tag = Tag::factory()->create();
        $post = Post::factory()->for($author)->create();
        $post->tags()->attach($tag);

        $response = $this->actingAs($viewer, 'sanctum')->postJson("/api/posts/{$post->id}/like");

        $response->assertStatus(200)
            ->assertJsonPath('liked', true);

        $this->assertDatabaseHas('post_user_likes', [
            'user_id' => $viewer->id,
            'post_id' => $post->id,
        ]);
    }

    /**
     * Test unauthenticated user cannot like a post.
     */
    public function test_unauthenticated_user_cannot_like_post(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        $post = Post::factory()->for($user)->create();
        $post->tags()->attach($tag);

        $response = $this->postJson("/api/posts/{$post->id}/like");

        $response->assertStatus(401);
    }

    /**
     * Test liking a non-existent post returns 404.
     */
    public function test_liking_non_existent_post_returns_404(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/posts/99999/like');

        $response->assertStatus(404);
    }
}
