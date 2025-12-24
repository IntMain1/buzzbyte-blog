<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| BuzzByte Blog REST API
|
| Route Groups:
| - Public: /register, /login (rate limited 5/min)
| - Protected: All other endpoints (Sanctum auth required)
|
| @author Omar Tarek
|
*/

// Public routes (no authentication required)
// Rate limiting: 5 attempts per minute to prevent brute-force attacks
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Posts routes
    Route::apiResource('posts', PostController::class);

    // Comments routes
    Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{post}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Tags routes
    Route::apiResource('tags', TagController::class);
    
    // Like route
    Route::post('/posts/{id}/like', [\App\Http\Controllers\PostLikeController::class, 'toggle']);
});
