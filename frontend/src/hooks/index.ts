/**
 * Custom Hooks - Reusable State Logic
 * 
 * - useApi: Generic async data fetching with loading/error states
 * - useForm: Form state management with validation
 * - useLike: Post like toggle with optimistic updates
 * - useCountdown: Real-time countdown for post expiry
 * - useDarkMode: Theme toggle with localStorage + system preference
 * 
 * @author Omar Tarek
 */

export { useApi } from './useApi';
export { useForm } from './useForm';
export { useLike } from './useLike';
export { useCountdown } from './useCountdown';
export { useDarkMode } from './useDarkMode';
