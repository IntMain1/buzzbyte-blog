<?php

namespace Tests\Feature;

use App\Models\Tag;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests for Tag CRUD operations
 */
class TagTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can list tags.
     */
    public function test_user_can_list_tags(): void
    {
        $user = User::factory()->create();
        Tag::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/tags');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'tags' => [
                    '*' => ['id', 'name'],
                ],
            ]);
    }

    /**
     * Test user can create a tag.
     */
    public function test_user_can_create_tag(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/tags', [
            'name' => 'Laravel',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('tag.name', 'Laravel');

        $this->assertDatabaseHas('tags', ['name' => 'Laravel']);
    }

    /**
     * Test creating a tag with duplicate name fails.
     */
    public function test_creating_duplicate_tag_fails(): void
    {
        $user = User::factory()->create();
        Tag::factory()->create(['name' => 'Laravel']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/tags', [
            'name' => 'Laravel',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * Test tag name is required.
     */
    public function test_tag_name_is_required(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/tags', [
            'name' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * Test user can delete a tag.
     */
    public function test_user_can_delete_tag(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/tags/{$tag->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('tags', ['id' => $tag->id]);
    }

    /**
     * Test searching tags by name.
     */
    public function test_can_search_tags(): void
    {
        $user = User::factory()->create();
        Tag::factory()->create(['name' => 'Laravel']);
        Tag::factory()->create(['name' => 'React']);
        Tag::factory()->create(['name' => 'Vue']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/tags?search=Lar');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'tags');
    }

    /**
     * Test unauthenticated user cannot access tags.
     */
    public function test_unauthenticated_user_cannot_access_tags(): void
    {
        $response = $this->getJson('/api/tags');

        $response->assertStatus(401);
    }
}
