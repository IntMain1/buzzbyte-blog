/**
 * ErrorBoundary - Graceful Error Handling Component
 * 
 * React class component that catches JavaScript errors anywhere in the
 * child component tree and displays a fallback UI instead of crashing.
 * 
 * Features:
 * - Default fallback with error details (collapsible)
 * - "Try Again" and "Go Home" recovery actions
 * - Optional custom fallback UI
 * - Optional onError callback for logging/analytics
 * - HOC wrapper (withErrorBoundary) for easy usage
 * 
 * @author Omar Tarek
 */

import { Component, type ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ─────────────────────────────────────────────────────────────
// Default Fallback UI
// ─────────────────────────────────────────────────────────────
const DefaultFallback = ({
  error,
  onReset
}: {
  error: Error | null;
  onReset: () => void;
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
    <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center">
      {/* Error Icon */}
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Something went wrong
      </h1>

      {/* Message */}
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        We're sorry, but something unexpected happened. Please try again.
      </p>

      {/* Error Details (collapsed by default) */}
      {error && (
        <details className="mb-4 text-left">
          <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400">
            View error details
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-slate-700 rounded-lg text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-white font-medium rounded-lg transition"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Error Boundary Component
// ─────────────────────────────────────────────────────────────
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // In production, you could send to an error tracking service
    // e.g., Sentry.captureException(error);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default fallback UI
      return (
        <DefaultFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────
// HOC for wrapping components with error boundary
// ─────────────────────────────────────────────────────────────
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
