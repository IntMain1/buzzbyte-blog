/**
 * FormInput - Labeled Text Input Component
 * 
 * Features:
 * - Auto-generated ID from label
 * - Error state with red border/message
 * - Hint text support
 * - Accessible with aria-invalid and aria-describedby
 * - Uses forwardRef for form library compatibility
 * 
 * @author Omar Tarek
 */

import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  hint?: string;
  onChange?: (value: string) => void;
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const inputBaseStyles = 'w-full px-4 py-3 rounded-lg border transition focus:ring-2 focus:border-transparent';
const inputDefaultStyles = 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-indigo-500';
const inputErrorStyles = 'border-red-500 dark:border-red-500 focus:ring-red-500';

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, onChange, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const hasError = Boolean(error);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className={className}>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          onChange={handleChange}
          className={`${inputBaseStyles} ${hasError ? inputErrorStyles : inputDefaultStyles}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
