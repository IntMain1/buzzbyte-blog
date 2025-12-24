<?php

namespace App\Services;

use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * PostService - Business Logic Layer for Posts
 * 
 * Architecture: Service Layer Pattern (Thin Controller, Fat Service)
 * - Controllers handle HTTP concerns (validation, responses)
 * - Services contain business logic (creating, updating, deleting posts)
 * - Keeps controllers clean and testable
 * 
 * @author Omar Tarek
 */
class PostService
{
    public function getAllPosts(array $filters = [])
    {
        $query = Post::active()->with(['user', 'tags'])
            ->withCount(['comments', 'likes'])
            ->latest();

        if (!empty($filters['tag'])) {
            $query->whereHas('tags', function ($q) use ($filters) {
                $q->where('slug', $filters['tag']);
            });
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%");
            });
        }

        return $query->get()->map(function ($post) {
            $post->is_liked = Auth::check() 
                ? $post->likes()->where('user_id', Auth::id())->exists() 
                : false;
            return $post;
        });
    }

    public function getPostById(int $id): Post
    {
        $post = Post::active()->with(['user', 'tags', 'comments.user'])
            ->withCount(['comments', 'likes'])
            ->findOrFail($id);

        $post->is_liked = Auth::check() 
            ? $post->likes()->where('user_id', Auth::id())->exists() 
            : false;

        return $post;
    }

    public function createPost(array $data, ?UploadedFile $coverImage = null): Post
    {
        $post = new Post();
        $post->title = $data['title'];
        $post->body = $data['body'];
        $post->excerpt = $data['excerpt'] ?? null;
        $post->user_id = Auth::id();

        if ($coverImage) {
            $post->cover_image = $coverImage->store('post-covers', 'public');
        }

        $post->save();

        if (!empty($data['tags'])) {
            $post->tags()->attach($data['tags']);
        }

        return $post->fresh(['user', 'tags']);
    }

    public function updatePost(Post $post, array $data, ?UploadedFile $coverImage = null): Post
    {
        if (isset($data['title'])) {
            $post->title = $data['title'];
        }
        if (isset($data['body'])) {
            $post->body = $data['body'];
        }
        if (isset($data['excerpt'])) {
            $post->excerpt = $data['excerpt'];
        }

        if ($coverImage) {
            if ($post->cover_image) {
                Storage::disk('public')->delete($post->cover_image);
            }
            $post->cover_image = $coverImage->store('post-covers', 'public');
        }

        $post->save();

        if (isset($data['tags'])) {
            $post->tags()->sync($data['tags']);
        }

        return $post->fresh(['user', 'tags']);
    }

    public function deletePost(Post $post): bool
    {
        if ($post->cover_image) {
            Storage::disk('public')->delete($post->cover_image);
        }

        return $post->delete();
    }

    public function toggleLike(Post $post): array
    {
        $userId = Auth::id();
        $isLiked = $post->likes()->where('user_id', $userId)->exists();

        if ($isLiked) {
            $post->likes()->detach($userId);
        } else {
            $post->likes()->attach($userId);
        }

        return [
            'is_liked' => !$isLiked,
            'likes_count' => $post->likes()->count(),
        ];
    }

    private function storeImage(UploadedFile $image): string
    {
        return $image->store('posts', 'public');
    }
}

