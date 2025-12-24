/**
 * Skeleton - Loading Placeholder Components
 * 
 * Pre-built skeletons matching actual components:
 * - Skeleton: Base with shimmer animation
 * - SkeletonText: Multi-line text placeholder
 * - SkeletonAvatar: Circular user avatar
 * - PostCardSkeleton: Feed card layout
 * - PostDetailsSkeleton: Full post page
 * - FeedSkeleton: Multiple post cards
 * - FormSkeleton: Generic form layout
 * 
 * @author Omar Tarek
 */

// ─────────────────────────────────────────────────────────────
// Skeleton Loading Components
// ─────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

/**
 * Base Skeleton component with shimmer animation
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton rounded bg-gray-200 dark:bg-slate-700 ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Text skeleton - mimics a line of text
 */
export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton - circular placeholder
 */
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
}

/**
 * PostCard skeleton - matches PostCard layout
 */
export function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <Skeleton className="w-full md:w-48 h-48 md:h-auto rounded-none" />

        {/* Content */}
        <div className="flex-1 p-4 md:p-5">
          {/* Tags */}
          <div className="flex gap-2 mb-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* Title */}
          <Skeleton className="h-6 w-3/4 mb-2" />

          {/* Excerpt */}
          <SkeletonText lines={2} className="mb-4" />

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <SkeletonAvatar size="sm" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Feed skeleton - multiple post cards
 */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-label="Loading posts...">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * PostDetails skeleton - full post page
 */
export function PostDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Image */}
      <Skeleton className="w-full h-64 md:h-96 rounded-xl mb-6" />

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Title */}
      <Skeleton className="h-10 w-3/4 mb-4" />

      {/* Author & Meta */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-slate-700">
        <SkeletonAvatar size="lg" />
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 mb-12">
        <SkeletonText lines={3} />
        <SkeletonText lines={4} />
        <SkeletonText lines={2} />
      </div>

      {/* Comments header */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
        <Skeleton className="h-6 w-40 mb-6" />
        <Skeleton className="h-24 w-full rounded-lg mb-8" />

        {/* Comment skeletons */}
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <SkeletonAvatar size="sm" />
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <SkeletonText lines={2} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Form skeleton - generic form placeholder
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <div>
        <Skeleton className="h-4 w-12 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <Skeleton className="h-10 w-20 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}
