/**
 * Spinner - Loading Indicator Components
 * 
 * Spinner: Inline loading state (sizes: sm, md, lg, xl)
 * PageSpinner: Full-width centered spinner for page loads
 * 
 * Accessible with role="status" and screen reader text
 * 
 * @author Omar Tarek
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-4',
  xl: 'h-12 w-12 border-4',
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '', label = 'Loading' }: SpinnerProps) => (
  <div className={`flex justify-center items-center ${className}`} role="status" aria-label={label}>
    <div
      className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizeStyles[size]}`}
    />
    <span className="sr-only">{label}</span>
  </div>
);

// Full page spinner variant
export const PageSpinner = ({ label = 'Loading' }: { label?: string }) => (
  <div className="flex justify-center items-center py-12">
    <Spinner size="lg" label={label} />
  </div>
);
