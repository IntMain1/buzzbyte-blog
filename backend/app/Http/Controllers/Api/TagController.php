<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateTagRequest;
use App\Models\Tag;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

/**
 * TagController - Tag Management CRUD
 * 
 * Features:
 * - List tags with post counts (for filtering)
 * - Create tags (auto-generates slug via model)
 * - Show tag with related posts
 * - Update and delete tags
 * 
 * Note: No policy - tags are globally accessible
 * 
 * @author Omar Tarek
 */
class TagController extends Controller
{
    #[OA\Get(
        path: "/api/tags",
        summary: "List all tags",
        tags: ["Tags"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "search", in: "query", required: false, schema: new OA\Schema(type: "string"))],
        responses: [
            new OA\Response(response: 200, description: "List of tags", content: new OA\JsonContent(properties: [new OA\Property(property: "tags", type: "array", items: new OA\Items(ref: "#/components/schemas/Tag"))]))
        ]
    )]
    public function index(Request $request)
    {
        $query = Tag::withCount('posts');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $tags = $query->orderBy('name')->get();

        return response()->json([
            'tags' => $tags,
        ]);
    }

    #[OA\Post(
        path: "/api/tags",
        summary: "Create a new tag",
        tags: ["Tags"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ["name"], properties: [new OA\Property(property: "name", type: "string", maxLength: 50, example: "Technology")])),
        responses: [
            new OA\Response(response: 201, description: "Tag created"),
            new OA\Response(response: 422, description: "Validation error (duplicate name)")
        ]
    )]
    public function store(CreateTagRequest $request)
    {
        $validated = $request->validated();

        $tag = Tag::create($validated);

        return response()->json([
            'message' => 'Tag created successfully',
            'tag' => $tag,
        ], 201);
    }

    #[OA\Get(
        path: "/api/tags/{id}",
        summary: "Get tag with posts",
        tags: ["Tags"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "Tag details with posts")]
    )]
    public function show(Tag $tag)
    {
        $tag->load(['posts' => function ($query) {
            $query->with('user')->latest()->take(10);
        }]);
        $tag->loadCount('posts');

        return response()->json([
            'tag' => $tag,
        ]);
    }

    #[OA\Put(
        path: "/api/tags/{id}",
        summary: "Update a tag",
        tags: ["Tags"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ["name"], properties: [new OA\Property(property: "name", type: "string", maxLength: 50)])),
        responses: [new OA\Response(response: 200, description: "Tag updated")]
    )]
    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:tags,name,' . $tag->id],
        ]);

        $tag->update($validated);

        return response()->json([
            'message' => 'Tag updated successfully',
            'tag' => $tag->fresh(),
        ]);
    }

    #[OA\Delete(
        path: "/api/tags/{id}",
        summary: "Delete a tag",
        tags: ["Tags"],
        security: [["bearerAuth" => []]],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "Tag deleted")]
    )]
    public function destroy(Tag $tag)
    {
        $tag->delete();

        return response()->json([
            'message' => 'Tag deleted successfully',
        ]);
    }
}

