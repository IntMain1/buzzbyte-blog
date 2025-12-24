<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Post Model - Ephemeral Blog Posts (24-hour lifespan)
 * 
 * Key Features:
 * - Auto-expires after 24 hours (handled by scheduled job)
 * - Soft deletes for data integrity
 * - Many-to-many relationship with Tags
 * - Likes via pivot table (users can like posts)
 * 
 * @author Omar Tarek
 */
class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'body',
        'excerpt',
        'cover_image',
        'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_user_likes', 'post_id', 'user_id')->withTimestamps();
    }

    // Posts older than 24 hours
    public function scopeExpired($query)
    {
        return $query->where('created_at', '<=', now()->subHours(24));
    }

    // Posts younger than 24 hours (Active)
    public function scopeActive($query)
    {
        return $query->where('created_at', '>', now()->subHours(24));
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        return $this->created_at->addHours(24)->diffInHours(now()) < 2;
    }

    public function getExpiresInSecondsAttribute(): int
    {
        $expiresAt = $this->created_at->addHours(24);
        return max(0, now()->diffInSeconds($expiresAt, false));
    }
}

