/**
 * Avatar - User Profile Image Component
 * 
 * Features:
 * - Displays user image or initials fallback
 * - Auto-prefixes relative paths with storage URL
 * - Multiple sizes: sm, md, lg, xl
 * - Optional click handler for interactive avatars
 * 
 * @author Omar Tarek
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null | undefined;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
  onClick?: () => void;
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const sizeStyles: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-sm' },
  md: { container: 'w-10 h-10', text: 'text-base' },
  lg: { container: 'w-12 h-12', text: 'text-lg' },
  xl: { container: 'w-24 h-24', text: 'text-3xl' },
};

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────
const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `http://localhost:8000/storage/${path}`;
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export const Avatar = ({ src, alt, name, size = 'md', className = '', onClick }: AvatarProps) => {
  const imageUrl = getImageUrl(src);
  const styles = sizeStyles[size];
  const isClickable = Boolean(onClick);

  const baseClasses = `${styles.container} rounded-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-slate-700 ${className}`;
  const clickableClasses = isClickable ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500 transition' : '';

  return (
    <div
      className={`${baseClasses} ${clickableClasses}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`font-medium text-gray-500 dark:text-gray-400 ${styles.text}`}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
