<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "BuzzByte API",
    description: "RESTful API for BuzzByte Blog Application - A modern blog with ephemeral posts that auto-delete after 24 hours",
    contact: new OA\Contact(name: "Omar Tarek", email: "api@buzzbyte.com")
)]
#[OA\Server(url: "http://localhost:8000", description: "Development Server")]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Enter your Bearer token"
)]
#[OA\Tag(name: "Authentication", description: "User registration, login, logout, and profile management")]
#[OA\Tag(name: "Posts", description: "Blog post CRUD operations")]
#[OA\Tag(name: "Comments", description: "Comment management on posts")]
#[OA\Tag(name: "Tags", description: "Tag management for posts")]
#[OA\Tag(name: "Likes", description: "Post like/unlike functionality")]
#[OA\Schema(
    schema: "User",
    type: "object",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "name", type: "string", example: "John Doe"),
        new OA\Property(property: "email", type: "string", format: "email", example: "john@example.com"),
        new OA\Property(property: "image", type: "string", nullable: true, example: "profile-images/abc123.jpg"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time")
    ]
)]
#[OA\Schema(
    schema: "Post",
    type: "object",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "title", type: "string", example: "My First Post"),
        new OA\Property(property: "body", type: "string", example: "Post content in markdown..."),
        new OA\Property(property: "excerpt", type: "string", nullable: true),
        new OA\Property(property: "cover_image", type: "string", nullable: true),
        new OA\Property(property: "user", ref: "#/components/schemas/User"),
        new OA\Property(property: "tags", type: "array", items: new OA\Items(ref: "#/components/schemas/Tag")),
        new OA\Property(property: "comments_count", type: "integer", example: 5),
        new OA\Property(property: "likes_count", type: "integer", example: 10),
        new OA\Property(property: "is_liked", type: "boolean", example: false),
        new OA\Property(property: "created_at", type: "string", format: "date-time")
    ]
)]
#[OA\Schema(
    schema: "Tag",
    type: "object",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "name", type: "string", example: "Technology"),
        new OA\Property(property: "slug", type: "string", example: "technology"),
        new OA\Property(property: "posts_count", type: "integer", example: 15)
    ]
)]
#[OA\Schema(
    schema: "Comment",
    type: "object",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "body", type: "string", example: "Great post!"),
        new OA\Property(property: "user", ref: "#/components/schemas/User"),
        new OA\Property(property: "created_at", type: "string", format: "date-time")
    ]
)]
#[OA\Schema(
    schema: "ValidationError",
    type: "object",
    properties: [
        new OA\Property(property: "message", type: "string", example: "The given data was invalid."),
        new OA\Property(property: "errors", type: "object", example: ["email" => ["The email field is required."]])
    ]
)]
abstract class Controller
{
    use AuthorizesRequests;
}
