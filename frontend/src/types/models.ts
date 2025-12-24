/**
 * TypeScript Model Definitions
 * 
 * Mirrors Laravel Eloquent models for type safety:
 * - User, Post, Comment, Tag entities
 * - Form data interfaces for create/update operations
 * - API response types for axios calls
 * 
 * @author Omar Tarek
 */

// ─────────────────────────────────────────────────────────────
// User Model
// ─────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// Tag Model
// ─────────────────────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
}

// ─────────────────────────────────────────────────────────────
// Post Model
// ─────────────────────────────────────────────────────────────

export interface Post {
  id: number;
  title: string;
  body: string;
  image: string | null;
  user_id: number;
  user?: User;
  tags?: Tag[];
  comments?: Comment[];
  comments_count?: number;
  likes_count?: number;
  is_liked?: boolean;
  created_at: string;
  updated_at: string;
}

/** Form data for creating/updating a post */
export interface PostFormData {
  title: string;
  body: string;
  image?: File | null;
  tags: number[];
}

// ─────────────────────────────────────────────────────────────
// Comment Model
// ─────────────────────────────────────────────────────────────

export interface Comment {
  id: number;
  body: string;
  user_id: number;
  post_id: number;
  user?: User;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface PostListResponse {
  posts: Post[];
}

export interface PostResponse {
  post: Post;
}

export interface TagListResponse {
  tags: Tag[];
}

export interface CommentListResponse {
  comments: Comment[];
}
