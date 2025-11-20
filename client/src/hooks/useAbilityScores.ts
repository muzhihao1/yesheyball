/**
 * Unified Ability Scores Hook
 *
 * Single source of truth for ability scores across the entire application.
 * All components should use this hook instead of multiple data sources.
 *
 * Data Source: /api/v1/dashboard/summary
 * Returns: camelCase field names for consistency
 */

import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders } from '@/lib/auth-headers';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Ability Scores Interface (5-dimensional scoring system)
 *
 * All scores are 0-100:
 * - accuracy: 准度分 (Accuracy Score)
 * - spin: 杆法分 (Spin Control Score)
 * - positioning: 走位分 (Positioning Score)
 * - power: 发力分 (Power Score)
 * - strategy: 策略分 (Strategy Score)
 * - clearance: 清台能力总分 (Overall Clearance Score)
 */
export interface AbilityScores {
  accuracy: number;
  spin: number;
  positioning: number;
  power: number;
  strategy: number;
  clearance: number;
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Fetch user's ability scores (5-dimensional scoring)
 *
 * This is the ONLY hook that should be used for ability scores.
 * It provides a single source of truth and ensures data consistency.
 *
 * @returns Query result containing ability scores
 *
 * @example
 * ```tsx
 * const { data: scores, isLoading } = useAbilityScores();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <div>
 *     <p>准度分: {scores?.accuracy}</p>
 *     <p>清台能力: {scores?.clearance}</p>
 *   </div>
 * );
 * ```
 */
export function useAbilityScores() {
  return useQuery<AbilityScores>({
    queryKey: ['/api/ability-scores'],  // Unified cache key
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/v1/dashboard/summary', {
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ability scores');
      }

      const data = await response.json();

      // Return ability scores directly from dashboard summary
      // Already in camelCase format
      return data.abilityScores as AbilityScores;
    },
    staleTime: 2 * 60 * 1000,  // Cache for 2 minutes
  });
}

/**
 * Query key factory for cache invalidation
 *
 * Use this when you need to invalidate ability scores cache:
 *
 * @example
 * ```tsx
 * import { queryClient } from '@/lib/queryClient';
 * import { abilityScoresKeys } from '@/hooks/useAbilityScores';
 *
 * // After training completion
 * queryClient.invalidateQueries({ queryKey: abilityScoresKeys.all });
 * ```
 */
export const abilityScoresKeys = {
  all: ['/api/ability-scores'] as const,
};
