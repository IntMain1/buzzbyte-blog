<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreatePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * PostController - HTTP Layer for Post Operations
 * 
 * Architecture: Thin Controller Pattern
 * - Uses Form Request classes for validation (CreatePostRequest, UpdatePostRequest)
 * - Delegates business logic to PostService (dependency injection)
 * - Uses Laravel Policies for authorization (owner-only updates/deletes)
 * - OpenAPI annotations for Swagger documentation
 * 
 * @author Omar Tarek
 */
class PostController extends Controller
{
    public function __construct(
        private PostService $postService
    ) {
    }

    #[OA\Get(
        path: "/api/posts",
        summary: "List all posts",
        tags: ["Posts"],
        security: [["bearerAuth" => []]],
        parameters: [
            new OA\Parameter(name: "search", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "tag", in: "query", required: false, schema: new OA\Schema(type: "string"))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of posts",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/Post")),
                        new OA\Property(property: "message", type: "string")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [
                'search' => $request->get('search'),
                'tag' => $request->get('tag'),
            ];

            $posts = $this->postService->getAllPosts($filters);

            return response()->json([
                'data' => $posts,
                'message' => 'Posts retrieved successfully',
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve posts', $e);
        }
    }

    #[OA\Post(
        path: "/api/posts",
        summary: "Create a new post",
        tags: ["Posts"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["title", "body", "tags"],
                    properties: [
                        new OA\Property(property: "title", type: "string", maxLength: 255, example: "My First Post"),
                        new OA\Property(property: "body", type: "string", example: "Post content in markdown..."),
                        new OA\Property(property: "tags", type: "array", items: new OA\Items(type: "integer"), example: [1, 2]),
                        new OA\Property(property: "cover_image", type: "string", format: "binary")
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Post created successfully"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(CreatePostRequest $request): JsonResponse
    {
        try {
            $post = $this->postService->createPost(
                $request->validated(),
                $request->file('cover_image')
            );

            return response()->json([
                'message' => 'Post created successfully',
                'post' => $post,
            ], 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create post', $e);
        }
    }

    #[OA\Get(
        path: "/api/posts/{id}",
        summary: "Get a single post",
        tags: ["Posts"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Post details", content: new OA\JsonContent(properties: [new OA\Property(property: "post", ref: "#/components/schemas/Post")])),
            new OA\Response(response: 404, description: "Post not found")
        ]
    )]
    public function show(Post $post): JsonResponse
    {
        try {
            $post = $this->postService->getPostById($post->id);

            return response()->json([
                'post' => $post,
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve post', $e);
        }
    }

    #[OA\Put(
        path: "/api/posts/{id}",
        summary: "Update a post (owner only)",
        tags: ["Posts"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Post updated"),
            new OA\Response(response: 403, description: "Forbidden - not the owner"),
            new OA\Response(response: 404, description: "Post not found")
        ]
    )]
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        try {
            $updatedPost = $this->postService->updatePost(
                $post,
                $request->validated(),
                $request->file('cover_image')
            );

            return response()->json([
                'message' => 'Post updated successfully',
                'post' => $updatedPost,
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update post', $e);
        }
    }

    #[OA\Delete(
        path: "/api/posts/{id}",
        summary: "Delete a post (owner only)",
        tags: ["Posts"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Post deleted"),
            new OA\Response(response: 403, description: "Forbidden - not the owner"),
            new OA\Response(response: 404, description: "Post not found")
        ]
    )]
    public function destroy(Request $request, Post $post): JsonResponse
    {
        $this->authorize('delete', $post);

        try {
            $this->postService->deletePost($post);

            return response()->json([
                'message' => 'Post deleted successfully',
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete post', $e);
        }
    }

    private function errorResponse(string $message, \Exception $e): JsonResponse
    {
        $statusCode = 500;

        if ($e instanceof ModelNotFoundException) {
            $statusCode = 404;
            $message = 'Post not found';
        }

        logger()->error($message, [
            'exception' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'message' => $message,
            'error' => config('app.debug') ? $e->getMessage() : 'An error occurred',
        ], $statusCode);
    }
}

