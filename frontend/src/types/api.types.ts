/**
 * API Types - Async State Management & Error Handling
 * 
 * Core utilities for API interactions:
 * - AsyncState: Discriminated union (idle/loading/success/error)
 * - Type guards: isIdle, isLoading, isSuccess, isError
 * - Error parsing: getErrorMessage, getFieldErrors, isValidationError
 * - HTTP error message mapping
 * 
 * Works with Laravel's validation error format (422 responses)
 * 
 * @author Omar Tarek
 */

import type { AxiosError } from 'axios';

// ─────────────────────────────────────────────────────────────
// API State Types (Discriminated Unions)
// ─────────────────────────────────────────────────────────────

/** Idle state - no request has been made */
interface IdleState {
  status: 'idle';
}

/** Loading state - request is in progress */
interface LoadingState {
  status: 'loading';
}

/** Success state - request completed successfully */
interface SuccessState<T> {
  status: 'success';
  data: T;
}

/** Error state - request failed */
interface ErrorState {
  status: 'error';
  error: string;
  code?: number;
  validationErrors?: Record<string, string[]>;
}

/** Union type for async data states */
export type AsyncState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;

// ─────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────

/** Standard paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/** Standard API error response from Laravel */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// ─────────────────────────────────────────────────────────────
// Type Guards
// ─────────────────────────────────────────────────────────────

export const isIdle = <T>(state: AsyncState<T>): state is IdleState => state.status === 'idle';
export const isLoading = <T>(state: AsyncState<T>): state is LoadingState => state.status === 'loading';
export const isSuccess = <T>(state: AsyncState<T>): state is SuccessState<T> => state.status === 'success';
export const isError = <T>(state: AsyncState<T>): state is ErrorState => state.status === 'error';

// ─────────────────────────────────────────────────────────────
// Error Parsing Utilities
// ─────────────────────────────────────────────────────────────

/** Laravel validation error response structure */
interface LaravelValidationError {
  message: string;
  errors: Record<string, string[]>;
}

/** Check if error is a Laravel validation error (422) */
export const isValidationError = (error: unknown): error is AxiosError<LaravelValidationError> => {
  const axiosError = error as AxiosError;
  return axiosError?.response?.status === 422 &&
    typeof (axiosError.response?.data as LaravelValidationError)?.errors === 'object';
};

/** Get all validation errors as a flat array of messages */
export const getValidationErrors = (error: unknown): string[] => {
  if (!isValidationError(error)) return [];

  const validationErrors = (error.response?.data as LaravelValidationError).errors;
  return Object.values(validationErrors).flat();
};

/** Get validation errors grouped by field */
export const getFieldErrors = (error: unknown): Record<string, string[]> => {
  if (!isValidationError(error)) return {};
  return (error.response?.data as LaravelValidationError).errors;
};

/** Get the first validation error for a specific field */
export const getFieldError = (error: unknown, field: string): string | undefined => {
  const errors = getFieldErrors(error);
  return errors[field]?.[0];
};

// ─────────────────────────────────────────────────────────────
// Main Error Message Extractor
// ─────────────────────────────────────────────────────────────

/** HTTP status code to user-friendly message mapping */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Please log in to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'Request timed out. Please try again.',
  422: 'Please check your input and try again.',
  429: 'Too many requests. Please wait a moment.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable.',
  503: 'Service is under maintenance. Please try again later.',
};

/** Extract a user-friendly error message from any error type */
export const getErrorMessage = (error: unknown): string => {
  // String error
  if (typeof error === 'string') return error;

  // Standard Error object
  if (error instanceof Error && !(error as AxiosError).isAxiosError) {
    return error.message;
  }

  // Axios error with response
  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError?.response) {
    const { status, data } = axiosError.response;

    // Validation errors - return first error message
    if (status === 422 && data?.errors) {
      const firstError = Object.values(data.errors)[0];
      if (firstError?.[0]) return firstError[0];
    }

    // Server returned a message
    if (data?.message) return data.message;

    // Use standard HTTP error message
    if (HTTP_ERROR_MESSAGES[status]) return HTTP_ERROR_MESSAGES[status];
  }

  // Network error
  if (axiosError?.code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection.';
  }

  // Timeout
  if (axiosError?.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
};

// ─────────────────────────────────────────────────────────────
// Error State Creator
// ─────────────────────────────────────────────────────────────

/** Create a fully typed error state from an error */
export const createErrorState = (error: unknown): ErrorState => {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return {
    status: 'error',
    error: getErrorMessage(error),
    code: axiosError?.response?.status,
    validationErrors: isValidationError(error)
      ? getFieldErrors(error)
      : undefined,
  };
};
