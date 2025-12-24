/**
 * useApi Hook - Generic Async State Management
 * 
 * Pattern: Discriminated Unions for type-safe state
 * - status: 'idle' | 'loading' | 'success' | 'error'
 * - Callbacks for success/error handling
 * - Reset functionality
 * 
 * @author Omar Tarek
 */

import { useState, useCallback } from 'react';
import type { AsyncState } from '../types/api.types';
import { getErrorMessage } from '../types/api.types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseApiReturn<T, P extends unknown[]> {
  state: AsyncState<T>;
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

/**
 * Generic hook for handling async API calls with loading/error states
 * Uses discriminated unions for type-safe state management
 * 
 * @example
 * const { execute, isLoading, data, error } = useApi(postsApi.create, {
 *   onSuccess: () => navigate('/'),
 *   onError: (msg) => console.error(msg)
 * });
 */
export function useApi<T, P extends unknown[]>(
  apiFunction: (...params: P) => Promise<{ data: T }>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  const execute = useCallback(async (...params: P): Promise<T | null> => {
    setState({ status: 'loading' });

    try {
      const response = await apiFunction(...params);
      const data = response.data;
      setState({ status: 'success', data });
      options.onSuccess?.(data);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      setState({ status: 'error', error: message });
      options.onError?.(message);
      return null;
    }
  }, [apiFunction, options]);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  // Derived state for convenience
  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const isSuccess = state.status === 'success';
  const data = state.status === 'success' ? state.data : null;
  const error = state.status === 'error' ? state.error : null;

  return {
    state,
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    execute,
    reset,
  };
}
