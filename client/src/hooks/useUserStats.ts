/**
 * useUserStats Hook
 *
 * Unified hook for fetching user training statistics from the unified API endpoint.
 * This hook provides consistent data across all pages and components.
 *
 * Data returned:
 * - currentStreak: Consecutive training days from today/yesterday
 * - longestStreak: Historical best training streak
 * - totalDays: Total unique training days across all systems
 * - recentDays: Recent 7-day activity pattern
 *
 * Data source: Merged from Skills Library + 90-Day Challenge systems
 * API endpoint: GET /api/user/stats
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data: stats, isLoading } = useUserStats();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <p>Current Streak: {stats?.currentStreak} days</p>
 *       <p>Longest Streak: {stats?.longestStreak} days</p>
 *       <p>Total Days: {stats?.totalDays} days</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from '@/lib/auth-headers';

/**
 * Get Authorization headers with JWT token for authenticated requests
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const accessToken = localStorage.getItem('supabase_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

/**
 * User training statistics interface
 */
export interface UserStats {
  /** Current consecutive training days (from today/yesterday) */
  currentStreak: number;

  /** Historical longest consecutive training days */
  longestStreak: number;

  /** Total unique training days across all systems */
  totalDays: number;

  /** Recent 7-day activity pattern: [{ date: "2025-01-15", count: 2 }, ...] */
  recentDays: Array<{ date: string; count: number }>;
}

/**
 * Fetch user training statistics from the unified API endpoint
 *
 * @returns User stats data
 */
async function fetchUserStats(): Promise<UserStats> {
  const response = await fetch("/api/user/stats", {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user stats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Custom hook to fetch user training statistics
 *
 * Uses TanStack Query for automatic caching, refetching, and error handling.
 *
 * @param options - TanStack Query options (optional)
 * @returns Query result with user stats data
 */
export function useUserStats(options?: {
  /** Enable/disable the query (default: true) */
  enabled?: boolean;
  /** Refetch interval in ms (default: none) */
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: ["/api/user/stats"],
    queryFn: fetchUserStats,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    ...options,
  });
}
