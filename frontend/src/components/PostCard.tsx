/**
 * PostCard - Blog Post Preview Component
 * 
 * Displays post in feed with:
 * - Cover image or first-letter placeholder
 * - Expiry indicator (shows time remaining until 24h auto-delete)
 * - Like button with optimistic UI updates (via useLike hook)
 * - Tag pills, comment count, author info
 * 
 * @author Omar Tarek
 */

import { Link } from 'react-router-dom';
import { useLike } from '../hooks';
import { Avatar, ExpiryBadge, ExpiryIndicator } from './ui';

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────
const getImageUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `http://localhost:8000/storage/${path}`;
};

const stripHtml = (html: string): string => html.replace(/<[^>]+>/g, '');

const truncate = (text: string, max = 150): string => {
  const clean = stripHtml(text);
  return clean.length <= max ? clean : `${clean.substring(0, max)}...`;
};

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
// ClockIcon moved to ExpiryIndicator component

const CommentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg className={`w-4 h-4 ${filled ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
const TagBadge = ({ name }: { name: string }) => (
  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded">
    {name}
  </span>
);

// ExpiringBadge moved to components/ui/ExpiryIndicator.tsx

// ─────────────────────────────────────────────────────────────
// Post type for PostCard (standalone to match API response)
// ─────────────────────────────────────────────────────────────
interface PostCardData {
  id: number;
  title: string;
  body: string;
  image?: string | null;
  cover_image?: string | null;
  user?: { id: number; name: string; image?: string | null };
  tags?: { id: number; name: string; slug: string }[];
  excerpt?: string | null;
  comments_count?: number;
  likes_count?: number;
  is_liked?: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function PostCard({ post }: { post: PostCardData }) {
  const { likesCount, isLiked, isLoading: isLiking, toggleLike } = useLike(
    post.id,
    post.likes_count ?? 0,
    post.is_liked ?? false
  );

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleLike();
  };

  return (
    <Link
      to={`/posts/${post.id}`}
      className="group block bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-700"
    >
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
          {post.cover_image || post.image ? (
            <img src={getImageUrl(post.cover_image || post.image)} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-4xl text-white/50">{post.title[0]}</span>
            </div>
          )}
          <ExpiryBadge createdAt={post.created_at} />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-5">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {post.tags?.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} name={tag.name} />
            ))}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {post.excerpt || truncate(post.body)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
            {/* Author */}
            <div className="flex items-center gap-2">
              <Avatar src={post.user?.image} name={post.user?.name || 'User'} size="sm" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{post.user?.name}</span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <CommentIcon />
                {post.comments_count ?? 0}
              </span>

              <button
                onClick={handleLikeClick}
                disabled={isLiking}
                className={`flex items-center gap-1 transition ${isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
              >
                <HeartIcon filled={isLiked} />
                {likesCount}
              </button>

              <ExpiryIndicator createdAt={post.created_at} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
