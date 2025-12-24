/**
 * useDarkMode Hook - Theme Management
 * 
 * Features:
 * - Persists preference to localStorage
 * - Detects system preference (prefers-color-scheme)
 * - Syncs with DOM (adds/removes 'dark' class on html element)
 * - Listens for system preference changes
 * 
 * @author Omar Tarek
 */

import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'darkMode';
const DARK_CLASS = 'dark';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface UseDarkModeReturn {
  isDark: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

/**
 * Hook to manage dark mode with localStorage persistence and system preference detection
 * 
 * @example
 * const { isDark, toggle } = useDarkMode();
 */
export function useDarkMode(): UseDarkModeReturn {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
    localStorage.setItem(STORAGE_KEY, String(isDark));
  }, [isDark]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      // Only update if no explicit preference is stored
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggle = useCallback(() => setIsDark((prev) => !prev), []);
  const enable = useCallback(() => setIsDark(true), []);
  const disable = useCallback(() => setIsDark(false), []);

  return { isDark, toggle, enable, disable };
}
