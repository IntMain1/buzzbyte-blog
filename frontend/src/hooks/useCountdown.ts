/**
 * useCountdown Hook - Real-time Expiry Timer
 * 
 * Core feature for ephemeral posts:
 * - Updates every second via setInterval
 * - Returns hours/minutes/seconds separately
 * - Provides formatted display string
 * - Tracks isExpired and isExpiringSoon states
 * 
 * @author Omar Tarek
 */

import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface UseCountdownReturn {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  formatted: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const EXPIRING_SOON_THRESHOLD_HOURS = 6;

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

/**
 * Hook to calculate and display countdown to expiration
 * 
 * @param createdAt - ISO date string when the item was created
 * @param expiresInHours - Number of hours until expiration (default: 24)
 * 
 * @example
 * const { formatted, isExpiringSoon } = useCountdown(post.created_at);
 */
export function useCountdown(
  createdAt: string,
  expiresInHours: number = 24
): UseCountdownReturn {
  const calculateTimeLeft = useCallback(() => {
    const created = new Date(createdAt).getTime();
    const expiresAt = created + expiresInHours * 60 * 60 * 1000;
    const now = Date.now();
    const diff = expiresAt - now;

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, [createdAt, expiresInHours]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const { hours, minutes, seconds } = timeLeft;
  const isExpired = hours === 0 && minutes === 0 && seconds === 0;
  const isExpiringSoon = hours < EXPIRING_SOON_THRESHOLD_HOURS && !isExpired;

  // Format as "Xh Ym" or "Ym Zs" for short times
  const formatted = isExpired
    ? 'Expired'
    : hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m ${seconds}s`;

  return {
    hours,
    minutes,
    seconds,
    isExpired,
    isExpiringSoon,
    formatted,
  };
}
