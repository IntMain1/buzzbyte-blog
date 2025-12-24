<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Services\CommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * CommentController - Nested Resource for Post Comments
 * 
 * Architecture: RESTful nested resource (posts/{postId}/comments)
 * - Follows Laravel resource routing conventions
 * - Uses CommentPolicy for owner-only edit/delete authorization
 * 
 * @author Omar Tarek
 */
class CommentController extends Controller
{
    public function __construct(
        private CommentService $commentService
    ) {
    }

    #[OA\Get(
        path: "/api/posts/{postId}/comments",
        summary: "List comments for a post",
        tags: ["Comments"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "postId", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "List of comments", content: new OA\JsonContent(properties: [new OA\Property(property: "comments", type: "array", items: new OA\Items(ref: "#/components/schemas/Comment"))])),
            new OA\Response(response: 404, description: "Post not found")
        ]
    )]
    public function index(Post $post): JsonResponse
    {
        try {
            $comments = $this->commentService->getCommentsForPost($post);

            return response()->json([
                'comments' => $comments,
                'message' => 'Comments retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve comments', $e);
        }
    }

    #[OA\Post(
        path: "/api/posts/{postId}/comments",
        summary: "Add a comment to a post",
        tags: ["Comments"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "postId", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ["body"], properties: [new OA\Property(property: "body", type: "string", maxLength: 1000, example: "Great post!")])),
        responses: [
            new OA\Response(response: 201, description: "Comment added"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(CreateCommentRequest $request, Post $post): JsonResponse
    {
        try {
            $comment = $this->commentService->createComment(
                $post,
                $request->validated()['body']
            );

            return response()->json([
                'message' => 'Comment added successfully',
                'comment' => $comment,
            ], 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create comment', $e);
        }
    }

    #[OA\Put(
        path: "/api/comments/{id}",
        summary: "Update a comment (owner only)",
        tags: ["Comments"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ["body"], properties: [new OA\Property(property: "body", type: "string", maxLength: 1000)])),
        responses: [
            new OA\Response(response: 200, description: "Comment updated"),
            new OA\Response(response: 403, description: "Forbidden - not the owner")
        ]
    )]
    public function update(UpdateCommentRequest $request, Comment $comment): JsonResponse
    {
        $this->authorize('update', $comment);

        try {
            $updatedComment = $this->commentService->updateComment(
                $comment,
                $request->validated()['body']
            );

            return response()->json([
                'message' => 'Comment updated successfully',
                'comment' => $updatedComment,
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update comment', $e);
        }
    }

    #[OA\Delete(
        path: "/api/comments/{id}",
        summary: "Delete a comment (owner only)",
        tags: ["Comments"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Comment deleted"),
            new OA\Response(response: 403, description: "Forbidden - not the owner")
        ]
    )]
    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        try {
            $this->commentService->deleteComment($comment);

            return response()->json([
                'message' => 'Comment deleted successfully',
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete comment', $e);
        }
    }

    private function errorResponse(string $message, \Exception $e): JsonResponse
    {
        logger()->error($message, [
            'exception' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'message' => $message,
            'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
        ], 500);
    }
}

