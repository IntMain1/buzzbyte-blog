<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can comment on any post.
     */
    public function test_user_can_comment_on_any_post(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $post = Post::factory()->for($user1)->create();

        $response = $this->actingAs($user2, 'sanctum')->postJson("/api/posts/{$post->id}/comments", [
            'body' => 'This is a great post!',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'comment' => ['id', 'body', 'user'],
            ]);

        $this->assertDatabaseHas('comments', [
            'body' => 'This is a great post!',
            'post_id' => $post->id,
            'user_id' => $user2->id,
        ]);
    }

    /**
     * Test user can update own comment.
     */
    public function test_user_can_update_own_comment(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->for($user)->create();
        $comment = Comment::factory()->for($post)->for($user)->create([
            'body' => 'Original comment',
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/comments/{$comment->id}", [
            'body' => 'Updated comment',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('comment.body', 'Updated comment');
    }

    /**
     * Test user cannot update others comment.
     */
    public function test_user_cannot_update_others_comment(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $post = Post::factory()->for($user1)->create();
        $comment = Comment::factory()->for($post)->for($user1)->create();

        $response = $this->actingAs($user2, 'sanctum')->putJson("/api/comments/{$comment->id}", [
            'body' => 'Hacked comment',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test user can delete own comment.
     */
    public function test_user_can_delete_own_comment(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->for($user)->create();
        $comment = Comment::factory()->for($post)->for($user)->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('comments', ['id' => $comment->id]);
    }

    /**
     * Test user cannot delete others comment.
     */
    public function test_user_cannot_delete_others_comment(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $post = Post::factory()->for($user1)->create();
        $comment = Comment::factory()->for($post)->for($user1)->create();

        $response = $this->actingAs($user2, 'sanctum')->deleteJson("/api/comments/{$comment->id}");

        $response->assertStatus(403);
    }
}
