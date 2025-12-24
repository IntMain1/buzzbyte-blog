<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

/**
 * AuthController - Authentication & User Management
 * 
 * Handles:
 * - Registration with optional profile image upload
 * - Login with Laravel Sanctum token generation
 * - Profile viewing and updates
 * - Logout (token revocation)
 * 
 * Security: Sanctum API tokens (stateless authentication)
 * 
 * @author Omar Tarek
 */
class AuthController extends Controller
{
    #[OA\Post(
        path: "/api/register",
        summary: "Register a new user",
        tags: ["Authentication"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["name", "email", "password", "password_confirmation"],
                    properties: [
                        new OA\Property(property: "name", type: "string", maxLength: 255, example: "John Doe"),
                        new OA\Property(property: "email", type: "string", format: "email", example: "john@example.com"),
                        new OA\Property(property: "password", type: "string", minLength: 8, example: "password123"),
                        new OA\Property(property: "password_confirmation", type: "string", example: "password123"),
                        new OA\Property(property: "image", type: "string", format: "binary", description: "Profile image (jpeg, png, jpg, gif, max 2MB)")
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "User registered successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "User registered successfully"),
                        new OA\Property(property: "user", ref: "#/components/schemas/User"),
                        new OA\Property(property: "token", type: "string", example: "1|abc123...")
                    ]
                )
            ),
            new OA\Response(response: 422, description: "Validation error", content: new OA\JsonContent(ref: "#/components/schemas/ValidationError"))
        ]
    )]
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('profile-images', 'public');
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'image' => $imagePath,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    #[OA\Post(
        path: "/api/login",
        summary: "Login and get access token",
        tags: ["Authentication"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "password"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "demo@buzzbyte.com"),
                    new OA\Property(property: "password", type: "string", example: "demo1234")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Login successful",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Login successful"),
                        new OA\Property(property: "user", ref: "#/components/schemas/User"),
                        new OA\Property(property: "token", type: "string", example: "1|abc123...")
                    ]
                )
            ),
            new OA\Response(response: 422, description: "Invalid credentials", content: new OA\JsonContent(ref: "#/components/schemas/ValidationError"))
        ]
    )]
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    #[OA\Get(
        path: "/api/me",
        summary: "Get authenticated user",
        tags: ["Authentication"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Current user data",
                content: new OA\JsonContent(
                    properties: [new OA\Property(property: "user", ref: "#/components/schemas/User")]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated")
        ]
    )]
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    #[OA\Post(
        path: "/api/logout",
        summary: "Logout and revoke token",
        tags: ["Authentication"],
        security: [["bearerAuth" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "Logged out successfully",
                content: new OA\JsonContent(
                    properties: [new OA\Property(property: "message", type: "string", example: "Logged out successfully")]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated")
        ]
    )]
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    #[OA\Put(
        path: "/api/profile",
        summary: "Update user profile",
        tags: ["Authentication"],
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: "name", type: "string", maxLength: 255),
                        new OA\Property(property: "email", type: "string", format: "email"),
                        new OA\Property(property: "image", type: "string", format: "binary")
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Profile updated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Profile updated successfully"),
                        new OA\Property(property: "user", ref: "#/components/schemas/User")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048', 'dimensions:max_width=2000,max_height=2000'],
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($user->image) {
                Storage::disk('public')->delete($user->image);
            }
            $validated['image'] = $request->file('image')->store('profile-images', 'public');
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ]);
    }
}

