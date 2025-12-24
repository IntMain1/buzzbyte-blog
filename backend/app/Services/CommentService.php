<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;

/**
 * CommentService - Business Logic for Comments
 * 
 * Handles:
 * - Fetching comments for a post (with user eager loading)
 * - Creating, updating, deleting comments
 * - Associates comments with authenticated user
 * 
 * @author Omar Tarek
 */
class CommentService
{
    public function getCommentsForPost(Post $post)
    {
        return Comment::with('user')
            ->where('post_id', $post->id)
            ->latest()
            ->get();
    }

    public function createComment(Post $post, string $body): Comment
    {
        $comment = new Comment();
        $comment->body = $body;
        $comment->user_id = Auth::id();
        $comment->post_id = $post->id;
        $comment->save();

        return $comment->fresh('user');
    }

    public function updateComment(Comment $comment, string $body): Comment
    {
        $comment->body = $body;
        $comment->save();

        return $comment->fresh('user');
    }

    public function deleteComment(Comment $comment): bool
    {
        return $comment->delete();
    }
}

