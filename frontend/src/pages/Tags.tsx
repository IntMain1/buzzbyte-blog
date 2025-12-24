/**
 * Tags - Tag Management Admin Page
 * 
 * Features:
 * - Create new tags (auto-generates slug)
 * - Delete existing tags (with confirmation)
 * - View stats: total tags, most used, unused count
 * - Data table with post count per tag
 * 
 * @author Omar Tarek
 */

import { useState, useEffect, useCallback } from 'react';
import { tagsApi } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { Button, FormInput, Alert, PageSpinner, EmptyState } from '../components/ui';
import { getErrorMessage } from '../types';
import type { Tag } from '../types';
import Header from '../components/Header';

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const TagRow = ({ tag, onDelete }: { tag: Tag; onDelete: (id: number) => void }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
    <td className="px-4 py-3">
      <span className="font-medium text-gray-900 dark:text-white">{tag.name}</span>
    </td>
    <td className="px-4 py-3">
      <span className="text-gray-500 dark:text-gray-400">{tag.slug}</span>
    </td>
    <td className="px-4 py-3">
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm">
        {tag.posts_count ?? 0}
      </span>
    </td>
    <td className="px-4 py-3">
      <Button variant="ghost" size="sm" onClick={() => onDelete(tag.id)} className="text-red-600 hover:text-red-700">
        Delete
      </Button>
    </td>
  </tr>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function Tags() {
  const { showToast } = useToast();

  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const loadTags = useCallback(async () => {
    try {
      const response = await tagsApi.list();
      setTags(response.data.tags);
    } catch {
      showToast('Failed to load tags', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreateTag = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsCreating(true);
    setError('');

    try {
      await tagsApi.create(newTagName);
      setNewTagName('');
      showToast('Tag created', 'success');
      loadTags();
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsCreating(false);
    }
  }, [newTagName, loadTags, showToast]);

  const handleDeleteTag = useCallback(async (tagId: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      await tagsApi.delete(tagId);
      showToast('Tag deleted', 'success');
      loadTags();
    } catch {
      showToast('Failed to delete tag', 'error');
    }
  }, [loadTags, showToast]);

  const mostUsedTag = tags.length > 0 ? tags.reduce((a, b) => ((a.posts_count ?? 0) > (b.posts_count ?? 0) ? a : b)).name : '-';
  const unusedCount = tags.filter((t) => (t.posts_count ?? 0) === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />

      <main className="container-app py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tags Management</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Tags" value={tags.length} />
            <StatCard label="Most Used" value={mostUsedTag} />
            <StatCard label="Unused Tags" value={unusedCount} />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm mb-6">
            <form onSubmit={handleCreateTag} className="flex gap-3">
              <div className="flex-1">
                <FormInput
                  label=""
                  value={newTagName}
                  onChange={setNewTagName}
                  placeholder="Enter new tag name..."
                />
              </div>
              <Button type="submit" isLoading={isCreating} loadingText="Creating..." disabled={!newTagName.trim()}>
                Create Tag
              </Button>
            </form>
            {error && <Alert variant="error" className="mt-2">{error}</Alert>}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <PageSpinner />
            ) : tags.length === 0 ? (
              <EmptyState title="No tags created yet" description="Create your first tag above" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-700 text-left">
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Slug</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Posts</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {tags.map((tag) => (
                      <TagRow key={tag.id} tag={tag} onDelete={handleDeleteTag} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
