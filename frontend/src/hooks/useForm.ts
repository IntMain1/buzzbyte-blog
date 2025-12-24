/**
 * useForm Hook - Generic Form State Management
 * 
 * Features:
 * - Type-safe field configuration with validation rules
 * - Per-field error tracking and touched state
 * - getFieldProps helper for easy input binding
 * - isDirty detection for unsaved changes
 * - Reset to initial values
 * 
 * @author Omar Tarek
 */

import { useState, useCallback, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ValidationRule<T> = (value: T, formData: Record<string, unknown>) => string | null;

interface FieldConfig<T> {
  initialValue: T;
  validate?: ValidationRule<T>;
}

type FormConfig<T extends Record<string, unknown>> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

type FormErrors<T> = Partial<Record<keyof T, string>>;

interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
  handleBlur: <K extends keyof T>(field: K) => () => void;
  validate: () => boolean;
  reset: () => void;
  getFieldProps: <K extends keyof T>(field: K) => {
    value: T[K];
    onChange: (value: T[K]) => void;
    error: string | undefined;
  };
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

/**
 * Generic form hook with validation and field helpers
 * 
 * @example
 * const { values, errors, handleChange, validate } = useForm({
 *   email: { initialValue: '', validate: (v) => !v ? 'Required' : null },
 *   password: { initialValue: '', validate: (v) => v.length < 6 ? 'Too short' : null }
 * });
 */
export function useForm<T extends Record<string, unknown>>(
  config: FormConfig<T>
): UseFormReturn<T> {
  // Extract initial values from config
  const initialValues = useMemo(() => {
    return Object.entries(config).reduce((acc, [key, field]) => {
      acc[key as keyof T] = (field as FieldConfig<T[keyof T]>).initialValue;
      return acc;
    }, {} as T);
  }, [config]);

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error when value changes
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const handleChange = useCallback(<K extends keyof T>(field: K) => (value: T[K]) => {
    setValue(field, value);
  }, [setValue]);

  const handleBlur = useCallback(<K extends keyof T>(field: K) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    for (const [key, fieldConfig] of Object.entries(config)) {
      const field = key as keyof T;
      const { validate: validateFn } = fieldConfig as FieldConfig<T[typeof field]>;

      if (validateFn) {
        const error = validateFn(values[field], values as Record<string, unknown>);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [config, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback(<K extends keyof T>(field: K) => ({
    value: values[field],
    onChange: handleChange(field),
    error: touched[field] ? errors[field] : undefined,
  }), [values, errors, touched, handleChange]);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setValue,
    setError,
    handleChange,
    handleBlur,
    validate,
    reset,
    getFieldProps,
  };
}
