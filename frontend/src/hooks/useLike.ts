/**
 * useLike Hook - Optimistic Like Toggle
 * 
 * Pattern: Optimistic UI Updates
 * - Updates UI immediately for responsive UX
 * - Syncs with server in background
 * - Reverts on error for data consistency
 * 
 * @author Omar Tarek
 */

import { useState, useCallback } from 'react';
import { postsApi } from '../lib/api';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface UseLikeReturn {
  likesCount: number;
  isLiked: boolean;
  isLoading: boolean;
  toggleLike: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

/**
 * Hook to manage post like state with optimistic updates
 * 
 * @example
 * const { likesCount, isLiked, toggleLike } = useLike(post.id, post.likes_count, post.is_liked);
 */
export function useLike(
  postId: number,
  initialCount: number = 0,
  initialIsLiked: boolean = false
): UseLikeReturn {
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = useCallback(async () => {
    if (isLoading) return;

    // Optimistic update
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLoading(true);

    try {
      const response = await postsApi.toggleLike(postId);
      // Sync with server response
      setLikesCount(response.data.likes_count);
      setIsLiked(response.data.is_liked);
    } catch {
      // Revert on error
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
    } finally {
      setIsLoading(false);
    }
  }, [postId, isLiked, isLoading]);

  return { likesCount, isLiked, isLoading, toggleLike };
}
