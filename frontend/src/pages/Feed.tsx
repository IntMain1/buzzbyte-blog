/**
 * Feed - Main Post Listing Page (Homepage)
 * 
 * Features:
 * - Search posts by title/content
 * - Filter by tags (URL query params for shareable links)
 * - Lazy-loaded post cards with like functionality
 * - Create new post button
 * 
 * @author Omar Tarek
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postsApi, tagsApi } from '../lib/api';
import { PageSpinner, EmptyState } from '../components/ui';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import type { Tag } from '../types';

// ─────────────────────────────────────────────────────────────
// Post type (matches API response)
// ─────────────────────────────────────────────────────────────
interface FeedPost {
  id: number;
  title: string;
  body: string;
  excerpt?: string | null;
  cover_image?: string | null;
  image?: string | null;
  user?: { id: number; name: string; image?: string | null };
  tags?: { id: number; name: string; slug: string }[];
  comments_count?: number;
  likes_count?: number;
  is_liked?: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TagChip = ({ tag, isSelected, onClick }: { tag: Tag; isSelected: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${isSelected
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
      }`}
  >
    {tag.name}
    <span className="ml-1 opacity-60">({tag.posts_count ?? 0})</span>
  </button>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function Feed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const selectedTag = searchParams.get('tag') || '';

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [postsRes, tagsRes] = await Promise.all([
        postsApi.list({
          search: searchParams.get('search') || undefined,
          tag: searchParams.get('tag') || undefined,
        }),
        tagsApi.list(),
      ]);
      setPosts(postsRes.data.data);
      setTags(tagsRes.data.tags);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    search ? params.set('search', search) : params.delete('search');
    setSearchParams(params);
  }, [search, searchParams, setSearchParams]);

  const toggleTag = useCallback((slug: string) => {
    const params = new URLSearchParams(searchParams);
    slug === selectedTag ? params.delete('tag') : params.set('tag', slug);
    setSearchParams(params);
  }, [selectedTag, searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />

      <main className="container-app py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Posts Feed</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Discover stories from our community</p>
          </div>
          <Link
            to="/posts/new"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition"
          >
            <PlusIcon />
            New Post
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-gray-100 dark:bg-slate-600 hover:bg-gray-200 dark:hover:bg-slate-500 text-gray-700 dark:text-white rounded-lg transition"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mb-2">
            {tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} isSelected={selectedTag === tag.slug} onClick={() => toggleTag(tag.slug)} />
            ))}
          </div>
        </div>

        {/* Posts */}
        {isLoading ? (
          <PageSpinner />
        ) : posts.length === 0 ? (
          <EmptyState title="No posts yet" description="Be the first to share something!" />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
