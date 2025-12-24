/**
 * UI Components Library - Reusable Design System
 * 
 * Components:
 * - Button: Primary action button with loading state
 * - FormInput: Labeled input with validation styling
 * - Alert: Success/error/warning messages
 * - Avatar: User image or initials fallback
 * - Spinner: Loading indicators
 * - ExpiryIndicator: Post countdown timer
 * - ConfirmDialog: Modal with confirm/cancel actions
 * - Skeleton: Loading placeholders
 * 
 * @author Omar Tarek
 */

export { Button } from './Button';
export { FormInput } from './FormInput';
export { Alert } from './Alert';
export { Spinner, PageSpinner } from './Spinner';
export { Avatar } from './Avatar';
export { AvatarUpload } from './AvatarUpload';
export { EmptyState } from './EmptyState';
export { ExpiryIndicator, ExpiryBadge } from './ExpiryIndicator';
export { ConfirmDialog, useConfirm } from './ConfirmDialog';
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  PostCardSkeleton,
  FeedSkeleton,
  PostDetailsSkeleton,
  FormSkeleton,
} from './Skeleton';

