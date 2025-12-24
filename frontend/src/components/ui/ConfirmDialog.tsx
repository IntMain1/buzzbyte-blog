/**
 * ConfirmDialog - Modal Confirmation Component
 * 
 * Replaces browser window.confirm() with styled modal:
 * - Variants: danger (red), warning (yellow), default
 * - Async confirm handlers with loading state
 * - useConfirm hook for promise-based usage
 * - Accessible with role="dialog" and aria-modal
 * 
 * @author Omar Tarek
 */

import { useState, useCallback } from 'react';
import { Button } from './Button';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────

const WarningIcon = () => (
  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const DangerIcon = () => (
  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

/**
 * ConfirmDialog - A modal dialog for confirming destructive actions
 * 
 * Replace window.confirm() with this component for better UX
 * 
 * @example
 * const [showConfirm, setShowConfirm] = useState(false);
 * 
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   title="Delete Post"
 *   message="Are you sure? This action cannot be undone."
 *   variant="danger"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  }, [onConfirm]);

  if (!isOpen) return null;

  const iconByVariant = {
    danger: <DangerIcon />,
    warning: <WarningIcon />,
    default: null,
  };

  const confirmButtonVariant = variant === 'danger' ? 'danger' : 'primary';
  const loading = isLoading || isProcessing;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 
            animate-scale-in transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            {iconByVariant[variant] && (
              <div className="flex-shrink-0 p-2 rounded-full bg-gray-100 dark:bg-slate-700">
                {iconByVariant[variant]}
              </div>
            )}
            <div className="flex-1">
              <h3
                id="confirm-dialog-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={confirmButtonVariant}
              onClick={handleConfirm}
              isLoading={loading}
              loadingText="Processing..."
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook for easier usage
// ─────────────────────────────────────────────────────────────

interface UseConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
}

export function useConfirm() {
  const [state, setState] = useState<{
    isOpen: boolean;
    options: UseConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: UseConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ isOpen: true, options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ isOpen: false, options: null, resolve: null });
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState({ isOpen: false, options: null, resolve: null });
  }, [state]);

  const DialogComponent = state.options ? (
    <ConfirmDialog
      isOpen={state.isOpen}
      title={state.options.title}
      message={state.options.message}
      confirmLabel={state.options.confirmLabel}
      variant={state.options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, ConfirmDialog: DialogComponent };
}
