import { useQuery } from "@tanstack/react-query";

/**
 * @deprecated This file is deprecated.
 *
 * USE INSTEAD: @/hooks/useAbilityScores
 *
 * This hook and interface are deprecated in favor of the unified ability scores system.
 * The new system uses camelCase field names and fetches from a single source of truth.
 *
 * Migration guide:
 * - Replace: import { useAbilityScoresForProfile } from '@/hooks/useAbilityScoresForProfile'
 * - With: import { useAbilityScores } from '@/hooks/useAbilityScores'
 * - Change: const { data } = useAbilityScoresForProfile(userId)
 * - To: const { data } = useAbilityScores()  // No userId parameter needed
 * - Update field names: accuracy_score → accuracy, spin_score → spin, etc.
 */

/**
 * Ability Scores Interface
 * Represents the 5-dimensional ability scoring system for billiards training
 * @deprecated Use AbilityScores from '@/hooks/useAbilityScores' instead
 */
export interface AbilityScores {
  accuracy_score: number;      // 准度分 (0-100)
  spin_score: number;           // 杆法分 (0-100)
  positioning_score: number;    // 走位分 (0-100)
  power_score: number;          // 发力分 (0-100)
  strategy_score: number;       // 策略分 (0-100)
  clearance_score: number;      // 清台能力总分 (0-100)
}

/**
 * Helper function to get JWT auth headers
 * Required for authenticated API requests
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
 * Hook to fetch user's ability scores for Profile page
 *
 * Reuses the existing ninety-day-progress API endpoint to retrieve
 * the user's complete ability score breakdown including:
 * - Accuracy (准度分)
 * - Spin Control (杆法分)
 * - Positioning (走位分)
 * - Power (发力分)
 * - Strategy (策略分)
 * - Overall Clearance Score (清台能力总分)
 *
 * @param userId - The user's ID to fetch scores for
 * @returns Query result with ability scores data
 */
export function useAbilityScoresForProfile(userId: string | undefined) {
  return useQuery<AbilityScores>({
    queryKey: [`/api/users/${userId}/ninety-day-progress`],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await fetch(`/api/users/${userId}/ninety-day-progress`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ability scores');
      }

      const data = await response.json();

      // Transform API response to AbilityScores interface
      return {
        accuracy_score: data.accuracy_score || 0,
        spin_score: data.spin_score || 0,
        positioning_score: data.positioning_score || 0,
        power_score: data.power_score || 0,
        strategy_score: data.strategy_score || 0,
        clearance_score: data.clearance_score || 0,
      };
    },
    enabled: !!userId, // Only run query when userId is available
    staleTime: 2 * 60 * 1000, // 2 minutes - refresh frequently for real-time updates
  });
}
