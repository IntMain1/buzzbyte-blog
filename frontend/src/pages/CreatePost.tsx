/**
 * CreatePost - Post Editor Page (Create & Edit)
 * 
 * Features:
 * - Markdown editor with live preview
 * - Cover image upload with preview
 * - Tag selection (multi-select)
 * - Reuses same component for create (/posts/new) and edit (/posts/:id/edit)
 * 
 * @author Omar Tarek
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsApi, tagsApi } from '../lib/api';
import Header from '../components/Header';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Tag {
  id: number;
  name: string;
  slug: string;
}

// ─────────────────────────────────────────────────────────────
// Reusable Components
// ─────────────────────────────────────────────────────────────
const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    {children}
  </div>
);

const ErrorAlert = ({ message }: { message: string }) => (
  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
    {message}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Image Uploader
// ─────────────────────────────────────────────────────────────
const ImageUploader = ({
  preview,
  onSelect,
}: {
  preview: string | null;
  onSelect: (file: File) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField label="Featured Image">
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 flex items-center justify-center group cursor-pointer"
      >
        {preview ? (
          <>
            <img src={preview} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-medium">Change Image</span>
            </div>
          </>
        ) : (
          <span className="text-gray-400">Click to upload cover image</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
        className="hidden"
      />
    </FormField>
  );
};

// ─────────────────────────────────────────────────────────────
// Tag Selector
// ─────────────────────────────────────────────────────────────
const TagSelector = ({
  tags,
  selected,
  onToggle,
}: {
  tags: Tag[];
  selected: number[];
  onToggle: (id: number) => void;
}) => (
  <FormField label="Tags">
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => onToggle(tag.id)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${selected.includes(tag.id)
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  </FormField>
);

// ─────────────────────────────────────────────────────────────
// Markdown Editor with Preview
// ─────────────────────────────────────────────────────────────
const MarkdownEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <FormField label="Content (Markdown)">
      <div className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 p-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${!showPreview
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                }`}
            >
              ✏️ Write
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${showPreview
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300'
                }`}
            >
              👁️ Preview
            </button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Supports Markdown
          </span>
        </div>

        {/* Editor / Preview */}
        {showPreview ? (
          <div className="prose prose-lg dark:prose-invert max-w-none min-h-[400px] p-4 bg-white dark:bg-slate-800">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Nothing to preview</p>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your post in Markdown...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet list
- Another item

> Blockquote

`inline code`

```
code block
```"
            className="w-full min-h-[400px] p-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none"
          />
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        💡 Markdown: <code>**bold**</code>, <code>*italic*</code>, <code># Heading</code>, <code>- list</code>, <code>&gt; quote</code>, <code>```code```</code>
      </p>
    </FormField>
  );
};

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const inputStyles = 'w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function CreatePost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handlers
  const handleImageSelect = useCallback((file: File) => {
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  }, []);

  const toggleTag = useCallback((id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }, []);

  // Validation
  const validate = useCallback(() => {
    if (!title.trim()) return 'Title is required';
    if (!content.trim()) return 'Content is required';
    if (selectedTags.length === 0) return 'Select at least one tag';
    return null;
  }, [title, content, selectedTags]);

  // Load tags
  useEffect(() => {
    tagsApi.list().then((res) => setAvailableTags(res.data.tags));
  }, []);

  // Load post data when editing
  useEffect(() => {
    if (!isEditing) return;

    postsApi.get(Number(id))
      .then((res) => {
        const post = res.data.post;
        setTitle(post.title);
        setContent(post.body); // Body contains markdown or HTML
        setExcerpt(post.excerpt || '');
        setSelectedTags(post.tags.map((t: Tag) => t.id));
        if (post.cover_image) {
          const url = post.cover_image.startsWith('http')
            ? post.cover_image
            : `http://localhost:8000/storage/${post.cover_image}`;
          setCoverPreview(url);
        }
      })
      .catch(() => navigate('/'));
  }, [id, isEditing, navigate]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('body', content); // Send raw markdown
      formData.append('excerpt', excerpt);
      selectedTags.forEach((tagId) => formData.append('tags[]', tagId.toString()));
      if (coverImage) formData.append('cover_image', coverImage);

      if (isEditing) {
        await postsApi.update(Number(id), formData);
      } else {
        await postsApi.create(formData);
      }
      navigate('/');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />

      <main className="container-app py-6 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h1>

          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <FormField label="Title">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className={inputStyles}
              />
            </FormField>

            {/* Cover Image */}
            <ImageUploader preview={coverPreview} onSelect={handleImageSelect} />

            {/* Tags */}
            <TagSelector tags={availableTags} selected={selectedTags} onToggle={toggleTag} />

            {/* Excerpt */}
            <FormField label="Excerpt">
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary of your post..."
                className={inputStyles}
              />
            </FormField>

            {/* Markdown Editor */}
            <MarkdownEditor value={content} onChange={setContent} />

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
