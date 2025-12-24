/**
 * ExpiryIndicator - Post Countdown Timer Component
 * 
 * Core feature for ephemeral 24-hour posts:
 * - Circular progress ring showing time remaining
 * - Color-coded urgency (green → yellow → orange → red)
 * - Pulsing animation when critical (< 1 hour)
 * - ExpiryBadge variant for compact display on cards
 * 
 * Uses useCountdown hook for real-time updates
 * 
 * @author Omar Tarek
 */

import { useMemo } from 'react';
import { useCountdown } from '../../hooks';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ExpiryIndicatorProps {
  createdAt: string;
  expiresInHours?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onExpire?: () => void;
}

type UrgencyLevel = 'safe' | 'warning' | 'danger' | 'critical';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const URGENCY_CONFIG: Record<UrgencyLevel, { color: string; bgColor: string; ringColor: string }> = {
  safe: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    ringColor: 'stroke-emerald-500',
  },
  warning: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    ringColor: 'stroke-amber-500',
  },
  danger: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    ringColor: 'stroke-orange-500',
  },
  critical: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    ringColor: 'stroke-red-500',
  },
};

const SIZE_CONFIG = {
  sm: { ring: 24, stroke: 2, fontSize: 'text-xs' },
  md: { ring: 32, stroke: 3, fontSize: 'text-sm' },
  lg: { ring: 40, stroke: 3, fontSize: 'text-base' },
};

// ─────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────

const getUrgencyLevel = (hours: number, isExpired: boolean): UrgencyLevel => {
  if (isExpired) return 'critical';
  if (hours < 1) return 'critical';
  if (hours < 6) return 'danger';
  if (hours < 12) return 'warning';
  return 'safe';
};

const calculatePercentage = (hours: number, minutes: number, totalHours: number): number => {
  const totalMinutesLeft = hours * 60 + minutes;
  const totalMinutesMax = totalHours * 60;
  return Math.max(0, Math.min(100, (totalMinutesLeft / totalMinutesMax) * 100));
};

// ─────────────────────────────────────────────────────────────
// Progress Ring Component
// ─────────────────────────────────────────────────────────────

const ProgressRing = ({
  percentage,
  size,
  strokeWidth,
  urgencyLevel,
}: {
  percentage: number;
  size: number;
  strokeWidth: number;
  urgencyLevel: UrgencyLevel;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const config = URGENCY_CONFIG[urgencyLevel];

  return (
    <svg
      width={size}
      height={size}
      className={`transform -rotate-90 ${urgencyLevel === 'critical' ? 'animate-pulse' : ''}`}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-gray-200 dark:text-slate-700"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className={`${config.ringColor} transition-all duration-500`}
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Clock Icon
// ─────────────────────────────────────────────────────────────

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

/**
 * ExpiryIndicator - A visual countdown component with progress ring
 * 
 * Features:
 * - Circular progress ring showing time remaining
 * - Color-coded urgency levels (green → yellow → orange → red)
 * - Pulsing animation when critical (< 1 hour)
 * - Responsive sizes (sm, md, lg)
 * 
 * @example
 * <ExpiryIndicator createdAt={post.created_at} size="md" showLabel />
 */
export function ExpiryIndicator({
  createdAt,
  expiresInHours = 24,
  size = 'md',
  showLabel = true,
  onExpire,
}: ExpiryIndicatorProps) {
  const { hours, minutes, seconds, isExpired, formatted } = useCountdown(createdAt, expiresInHours);

  // Call onExpire callback when expired
  useMemo(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  const urgencyLevel = getUrgencyLevel(hours, isExpired);
  const percentage = calculatePercentage(hours, minutes, expiresInHours);
  const config = URGENCY_CONFIG[urgencyLevel];
  const sizeConfig = SIZE_CONFIG[size];

  // Format time for accessibility
  const ariaLabel = isExpired
    ? 'Post has expired'
    : `${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bgColor}`}
      role="timer"
      aria-label={ariaLabel}
    >
      <div className="relative flex-shrink-0">
        <ProgressRing
          percentage={percentage}
          size={sizeConfig.ring}
          strokeWidth={sizeConfig.stroke}
          urgencyLevel={urgencyLevel}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <ClockIcon className={`w-3 h-3 ${config.color}`} />
        </div>
      </div>

      {showLabel && (
        <span className={`font-medium tabular-nums ${sizeConfig.fontSize} ${config.color}`}>
          {formatted}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Compact variant for cards
// ─────────────────────────────────────────────────────────────

export function ExpiryBadge({ createdAt }: { createdAt: string }) {
  const { hours, isExpired, formatted } = useCountdown(createdAt);
  const urgencyLevel = getUrgencyLevel(hours, isExpired);
  const config = URGENCY_CONFIG[urgencyLevel];

  if (!isExpired && hours >= 12) {
    // Don't show badge for posts with > 12 hours remaining
    return null;
  }

  return (
    <div
      className={`absolute top-2 left-2 px-2 py-1 ${config.bgColor} ${config.color} 
        text-xs font-bold rounded-md flex items-center gap-1 shadow-sm backdrop-blur-sm
        ${urgencyLevel === 'critical' ? 'animate-pulse' : ''}`}
    >
      <ClockIcon className="w-3.5 h-3.5" />
      {formatted}
    </div>
  );
}
