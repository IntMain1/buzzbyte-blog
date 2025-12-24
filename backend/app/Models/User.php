<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * User Model - Authentication Entity
 * 
 * Features:
 * - Sanctum API tokens (HasApiTokens) for stateless auth
 * - Soft deletes for data preservation
 * - Password auto-hashing via casts
 * 
 * Relationships:
 * - posts: User's authored posts
 * - comments: User's written comments
 * - likes: Posts liked by user (pivot table)
 * 
 * @author Omar Tarek
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the posts authored by the user.
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get the comments written by the user.
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the posts liked by the user.
     */
    public function likes()
    {
        return $this->belongsToMany(Post::class, 'post_user_likes', 'user_id', 'post_id')->withTimestamps();
    }
}
