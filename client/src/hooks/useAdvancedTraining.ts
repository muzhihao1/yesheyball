import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Advanced Training System Hooks (V2.1)
 *
 * Provides React Query hooks for interacting with the V2.1 advanced training system API
 * including Level 4-8 training paths, user progress tracking, and recommendations.
 *
 * @module useAdvancedTraining
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Training unit content structure stored in JSONB
 */
interface TrainingUnitContent {
  theory: string;
  steps: string[];
  tips: string[];
  common_mistakes: string[];
  practice_requirements: {
    min_duration_minutes: number;
    success_rate?: number;
    key_checkpoints: string[];
  };
  success_criteria: string[];
  related_courses: string[];
}

/**
 * Training unit with progress information
 */
interface TrainingUnit {
  id: string;
  title: string;
  unitType: string;
  unitOrder: number;
  xpReward: number;
  estimatedMinutes: number;
  content: TrainingUnitContent;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt: string | null;
}

/**
 * Sub-skill containing multiple training units
 */
interface SubSkill {
  id: string;
  skillId: string;
  subSkillName: string;
  subSkillOrder: number;
  description: string | null;
  units: TrainingUnit[];
}

/**
 * Skill containing multiple sub-skills
 */
interface Skill {
  id: string;
  levelId: string;
  skillName: string;
  skillOrder: number;
  description: string | null;
  subSkills: SubSkill[];
}

/**
 * Training level (4-8) with nested skills, sub-skills, and units
 */
interface TrainingLevel {
  id: string;
  levelNumber: number;
  title: string;
  description: string | null;
  skills: Skill[];
}

/**
 * Complete training path response
 */
interface TrainingPathResponse {
  levels: TrainingLevel[];
}

/**
 * User progress update payload
 */
interface UpdateProgressPayload {
  unitId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressData?: Record<string, any>;
}

/**
 * User progress update response
 */
interface UpdateProgressResponse {
  message: string;
  xpAwarded: number;
}

/**
 * Training recommendation item
 */
interface Recommendation {
  unitId: string;
  title: string;
  unitType: string;
  xpReward: number;
  estimatedMinutes: number;
  levelNumber: number;
  skillName: string;
  subSkillName: string;
  status: 'not_started' | 'in_progress';
  reason: string;
}

/**
 * Recommendations response
 */
interface RecommendationsResponse {
  recommendations: Recommendation[];
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Fetch the complete training path for Level 4-8 with user progress
 *
 * Returns a nested structure: levels -> skills -> sub-skills -> units
 * Each unit includes the user's completion status and progress data
 *
 * @returns {Object} Query result with training path data
 * @example
 * ```tsx
 * const { data, isLoading, error } = useTrainingPath();
 *
 * if (isLoading) return <div>加载中...</div>;
 * if (error) return <div>加载失败</div>;
 *
 * return (
 *   <div>
 *     {data?.levels.map(level => (
 *       <LevelCard key={level.id} level={level} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useTrainingPath() {
  return useQuery<TrainingPathResponse>({
    queryKey: ["/api/v2/training-path"],
    queryFn: async () => {
      const response = await fetch("/api/v2/training-path", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch training path: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - training data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false, // Don't refetch on every mount
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
  });
}

/**
 * Update user progress for a training unit
 *
 * Automatically invalidates and refetches the training path query
 * to reflect the updated progress. Awards XP when status is 'completed'.
 *
 * @returns {Object} Mutation object with mutate function
 * @example
 * ```tsx
 * const { mutate: updateProgress, isPending } = useUpdateProgress();
 *
 * const handleComplete = (unitId: string) => {
 *   updateProgress(
 *     { unitId, status: 'completed' },
 *     {
 *       onSuccess: (data) => {
 *         toast.success(`获得 ${data.xpAwarded} XP!`);
 *       },
 *       onError: (error) => {
 *         toast.error('更新失败，请重试');
 *       }
 *     }
 *   );
 * };
 * ```
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation<UpdateProgressResponse, Error, UpdateProgressPayload>({
    mutationFn: async (payload: UpdateProgressPayload) => {
      const response = await fetch("/api/v2/user-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update progress: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate training path to refetch with updated progress
      queryClient.invalidateQueries({ queryKey: ["/api/v2/training-path"] });
      // Also invalidate recommendations as they depend on progress
      queryClient.invalidateQueries({ queryKey: ["/api/v2/recommendations"] });
    },
  });
}

/**
 * Fetch personalized training recommendations
 *
 * Returns up to 10 recommended training units based on user progress.
 * Prioritizes incomplete units by level, showing units that are not started
 * or currently in progress.
 *
 * @returns {Object} Query result with recommendations data
 * @example
 * ```tsx
 * const { data, isLoading } = useRecommendations();
 *
 * if (isLoading) return <Skeleton />;
 *
 * return (
 *   <div className="space-y-4">
 *     <h2>推荐练习</h2>
 *     {data?.recommendations.map(rec => (
 *       <RecommendationCard key={rec.unitId} recommendation={rec} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useRecommendations() {
  return useQuery<RecommendationsResponse>({
    queryKey: ["/api/v2/recommendations"],
    queryFn: async () => {
      const response = await fetch("/api/v2/recommendations", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - recommendations should be relatively fresh
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Get statistics from the training path data
 *
 * Utility hook that computes useful statistics from the training path:
 * - Total units, completed units, completion percentage
 * - Per-level progress statistics
 * - Total XP earned vs available
 *
 * @param {TrainingPathResponse | undefined} trainingPath - Training path data
 * @returns {Object} Computed statistics
 * @example
 * ```tsx
 * const { data: trainingPath } = useTrainingPath();
 * const stats = useTrainingPathStats(trainingPath);
 *
 * return (
 *   <div>
 *     <p>完成进度: {stats.completionPercentage}%</p>
 *     <p>总XP: {stats.totalXpEarned} / {stats.totalXpAvailable}</p>
 *   </div>
 * );
 * ```
 */
export function useTrainingPathStats(trainingPath: TrainingPathResponse | undefined) {
  if (!trainingPath) {
    return {
      totalUnits: 0,
      completedUnits: 0,
      inProgressUnits: 0,
      notStartedUnits: 0,
      completionPercentage: 0,
      totalXpAvailable: 0,
      totalXpEarned: 0,
      levelStats: [],
    };
  }

  const levelStats = trainingPath.levels.map(level => {
    const units = level.skills.flatMap(skill =>
      skill.subSkills.flatMap(subSkill => subSkill.units)
    );

    const completed = units.filter(u => u.status === 'completed').length;
    const inProgress = units.filter(u => u.status === 'in_progress').length;
    const notStarted = units.filter(u => u.status === 'not_started').length;
    const xpAvailable = units.reduce((sum, u) => sum + (u.xpReward || 0), 0);
    const xpEarned = units
      .filter(u => u.status === 'completed')
      .reduce((sum, u) => sum + (u.xpReward || 0), 0);

    return {
      levelNumber: level.levelNumber,
      levelTitle: level.title,
      totalUnits: units.length,
      completed,
      inProgress,
      notStarted,
      completionPercentage: Math.round((completed / units.length) * 100),
      xpAvailable,
      xpEarned,
    };
  });

  const totalUnits = levelStats.reduce((sum, s) => sum + s.totalUnits, 0);
  const completedUnits = levelStats.reduce((sum, s) => sum + s.completed, 0);
  const inProgressUnits = levelStats.reduce((sum, s) => sum + s.inProgress, 0);
  const notStartedUnits = levelStats.reduce((sum, s) => sum + s.notStarted, 0);
  const totalXpAvailable = levelStats.reduce((sum, s) => sum + s.xpAvailable, 0);
  const totalXpEarned = levelStats.reduce((sum, s) => sum + s.xpEarned, 0);

  return {
    totalUnits,
    completedUnits,
    inProgressUnits,
    notStartedUnits,
    completionPercentage: totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0,
    totalXpAvailable,
    totalXpEarned,
    levelStats,
  };
}
