<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * PostPolicy - Authorization Rules for Posts
 * 
 * Laravel Policy pattern for fine-grained access control:
 * - Anyone can view posts (public read)
 * - Only authenticated users can create posts
 * - Only post owner can update/delete their posts
 * 
 * Used via: $this->authorize('update', $post) in controllers
 * 
 * @author Omar Tarek
 */
class PostPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Post $post): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    // Only the author can update their post
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }

    // Only the author can delete their post
    public function delete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }

    public function restore(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }

    public function forceDelete(User $user, Post $post): bool
    {
        return $user->id === $post->user_id;
    }
}

