/**
 * PostDetails - Full Post View with Comments
 * 
 * Features:
 * - Markdown rendering (via react-markdown + remark-gfm)
 * - Comment CRUD (add, edit, delete for owner)
 * - Like toggle with optimistic updates
 * - Owner actions: Edit and Delete post
 * - Expiry countdown indicator
 * 
 * @author Omar Tarek
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsApi, commentsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { PageSpinner, Avatar } from '../components/ui';
import Header from '../components/Header';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface User {
  id: number;
  name: string;
  image: string | null;
}

interface Comment {
  id: number;
  body: string;
  user: User;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  excerpt: string | null;
  cover_image: string | null;
  user: User;
  tags: { id: number; name: string; slug: string }[];
  comments: Comment[];
  likes_count: number;
  is_liked: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────
const getImageUrl = (path: string | null): string | undefined =>
  path ? (path.startsWith('http') ? path : `http://localhost:8000/storage/${path}`) : undefined;

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg className={`w-5 h-5 ${filled ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

const TagBadge = ({ name }: { name: string }) => (
  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full">
    {name}
  </span>
);

const LikeButton = ({ isLiked, count, onClick, disabled }: { isLiked: boolean; count: number; onClick: () => void; disabled: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 active:scale-95 ${isLiked
      ? 'border-red-300 bg-red-50 text-red-500 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
      : 'border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-slate-700 dark:hover:border-red-800 dark:hover:bg-red-900/20 dark:text-gray-400'
      }`}
  >
    <HeartIcon filled={isLiked} />
    <span className="font-medium">{count}</span>
  </button>
);

const OwnerActions = ({ postId, onDelete }: { postId: number; onDelete: () => void }) => (
  <div className="flex gap-2">
    <Link
      to={`/posts/${postId}/edit`}
      className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition"
    >
      Edit
    </Link>
    <button
      onClick={onDelete}
      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition"
    >
      Delete
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Comment Components
// ─────────────────────────────────────────────────────────────
const CommentForm = ({ onSubmit, isSubmitting }: { onSubmit: (text: string) => void; isSubmitting: boolean }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        rows={3}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

const CommentItem = ({
  comment,
  isOwner,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  isOwner: boolean;
  onEdit: (id: number, body: string) => void;
  onDelete: (id: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);

  const handleSave = () => {
    onEdit(comment.id, editText);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-4">
      <Avatar src={comment.user.image} name={comment.user.name} size="sm" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 dark:text-white">{comment.user.name}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</span>
        </div>

        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm resize-none"
              rows={2}
            />
            <div className="mt-2 flex gap-2">
              <button onClick={handleSave} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded">Save</button>
              <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-white rounded">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-300">{comment.body}</p>
            {isOwner && (
              <div className="mt-2 flex gap-3 text-sm">
                <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-indigo-600">Edit</button>
                <button onClick={() => onDelete(comment.id)} className="text-gray-500 hover:text-red-600">Delete</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Custom Hooks
// ─────────────────────────────────────────────────────────────
const useLike = (post: Post | null) => {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (post) {
      setLikesCount(post.likes_count);
      setIsLiked(post.is_liked);
    }
  }, [post]);

  const toggle = useCallback(async () => {
    if (isLiking || !post) return;

    const prev = { count: likesCount, liked: isLiked };
    setLikesCount((c) => (isLiked ? c - 1 : c + 1));
    setIsLiked(!isLiked);
    setIsLiking(true);

    try {
      const { data } = await postsApi.toggleLike(post.id);
      setLikesCount(data.likes_count);
      setIsLiked(data.liked);
    } catch {
      setLikesCount(prev.count);
      setIsLiked(prev.liked);
    } finally {
      setIsLiking(false);
    }
  }, [post, likesCount, isLiked, isLiking]);

  return { likesCount, isLiked, isLiking, toggle };
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { likesCount, isLiked, isLiking, toggle } = useLike(post);

  const loadPost = useCallback(async () => {
    try {
      const { data } = await postsApi.get(Number(id));
      setPost(data.post);
    } catch {
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleAddComment = async (body: string) => {
    setIsSubmitting(true);
    try {
      await commentsApi.create(Number(id), body);
      loadPost();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number, body: string) => {
    await commentsApi.update(commentId, body);
    loadPost();
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;
    await commentsApi.delete(commentId);
    loadPost();
  };

  const handleDeletePost = async () => {
    if (!confirm('Delete this post?')) return;
    await postsApi.delete(Number(id));
    navigate('/');
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 dark:bg-slate-900"><Header /><PageSpinner /></div>;
  if (!post) return <div className="min-h-screen bg-gray-50 dark:bg-slate-900"><Header /><div className="text-center py-20 text-xl text-gray-900 dark:text-white">Post not found</div></div>;

  const isOwner = user?.id && post?.user?.id && Number(user.id) === Number(post.user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />

      <main className="container-app py-6 max-w-4xl">
        {/* Cover Image */}
        {post.cover_image && (
          <div className="rounded-xl overflow-hidden mb-6 -mx-4 sm:mx-0">
            <img src={getImageUrl(post.cover_image)} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
          </div>
        )}

        <article>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => <TagBadge key={tag.id} name={tag.name} />)}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>

          {/* Author & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Avatar src={post.user.image} name={post.user.name} size="lg" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{post.user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LikeButton isLiked={isLiked} count={likesCount} onClick={toggle} disabled={isLiking} />
              {isOwner && <OwnerActions postId={post.id} onDelete={handleDeletePost} />}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>
        </article>

        {/* Comments Section */}
        <section className="border-t border-gray-200 dark:border-slate-700 pt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Comments ({post.comments.length})</h2>
          <CommentForm onSubmit={handleAddComment} isSubmitting={isSubmitting} />
          <div className="space-y-6">
            {post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwner={user?.id === comment.user.id}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
