<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can create post with tags.
     */
    public function test_user_can_create_post_with_tags(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/posts', [
            'title' => 'My First Post',
            'body' => '<p>This is the body of my first post.</p>',
            'tags' => [$tag->id],
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'post' => ['id', 'title', 'body', 'user', 'tags'],
            ]);

        $this->assertDatabaseHas('posts', [
            'title' => 'My First Post',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Test post requires at least one tag.
     */
    public function test_post_requires_at_least_one_tag(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/posts', [
            'title' => 'My Post',
            'body' => '<p>Post body</p>',
            'tags' => [],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tags']);
    }

    /**
     * Test user can update own post.
     */
    public function test_user_can_update_own_post(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        $post = Post::factory()->for($user)->create();
        $post->tags()->attach($tag);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/posts/{$post->id}", [
            'title' => 'Updated Title',
            'body' => '<p>Updated body content for the post.</p>',
            'tags' => [$tag->id],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('post.title', 'Updated Title');
    }

    /**
     * Test user cannot update others post.
     */
    public function test_user_cannot_update_others_post(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $tag = Tag::factory()->create();
        $post = Post::factory()->for($user1)->create();
        $post->tags()->attach($tag);

        $response = $this->actingAs($user2, 'sanctum')->putJson("/api/posts/{$post->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test user can delete own post.
     */
    public function test_user_can_delete_own_post(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        $post = Post::factory()->for($user)->create();
        $post->tags()->attach($tag);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    /**
     * Test user cannot delete others post.
     */
    public function test_user_cannot_delete_others_post(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $post = Post::factory()->for($user1)->create();

        $response = $this->actingAs($user2, 'sanctum')->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(403);
    }

    /**
     * Test can list posts.
     */
    public function test_can_list_posts(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();
        $post = Post::factory()->for($user)->create();
        $post->tags()->attach($tag);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/posts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'body', 'user', 'tags'],
                ],
            ]);
    }
}
