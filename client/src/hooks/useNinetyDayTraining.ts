import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 90-Day Training System Hooks (Fu Jiajun V2.1)
 *
 * Provides React Query hooks for interacting with the 90-day training system API
 * including ten core skills (十大招), curriculum, progress tracking, and training records.
 *
 * @module useNinetyDayTraining
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Ten Core Skill (十大招)
 */
export interface TencoreSkill {
  id: string;
  skillNumber: number; // 1-10
  skillName: string;
  description: string | null;
  trainingDays: number; // Number of training days needed for this skill
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 90-Day Curriculum Entry
 */
export interface NinetyDayCurriculum {
  id: string;
  dayNumber: number; // 1-90
  tencoreSkillId: string;
  trainingType: string; // '系统', '专项', '测试', '理论', '考核'
  title: string;
  description: string | null;
  originalCourseRef: string | null; // e.g., "第1集"
  objectives: string[]; // Training objectives
  keyPoints: string[]; // Key training points
  videoUrl: string | null;
  duration: number | null; // Expected duration in minutes
  difficulty: string | null; // '初级', '中级', '高级'
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Specialized Training Exercise (90-Day System)
 */
export interface NinetyDaySpecializedTraining {
  id: string;
  category: string; // '五分点', '力度', '分离角'
  name: string;
  description: string | null;
  trainingMethod: string | null;
  evaluationCriteria: Record<string, string>; // {"初级": "...", "中级": "...", "高级": "..."}
  relatedTencoreSkills: number[]; // [3, 4, 5]
  difficulty: string | null;
  estimatedDuration: number; // minutes
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User's 90-Day Progress
 */
export interface UserNinetyDayProgress {
  id: string;
  userId: string;
  currentDay: number; // 1-90
  completedDays: number[]; // [1, 2, 3, ...]
  tencoreProgress: Record<string, number>; // {"1": 60, "2": 40} - percentage for each skill
  specializedProgress: Record<string, number>;
  totalTrainingTime: number; // Total training time in minutes
  lastTrainingDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Training Record
 */
export interface NinetyDayTrainingRecord {
  id: string;
  userId: string;
  dayNumber: number;
  curriculumId: string;
  trainingType: string;
  duration: number; // minutes
  rating: number; // 1-5
  notes: string | null;
  createdAt: string;
}

/**
 * Complete day request payload
 */
export interface CompleteDayRequest {
  dayNumber: number;
  duration: number;
  rating: number;
  notes?: string;
}

/**
 * Complete day response
 */
export interface CompleteDayResponse {
  message: string;
  record: NinetyDayTrainingRecord;
  progress: UserNinetyDayProgress;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all ten core skills (十大招)
 * @returns Query result with list of ten core skills
 */
export function useTencoreSkills() {
  return useQuery<{ skills: TencoreSkill[] }>({
    queryKey: ["/api/tencore-skills"],
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Fetch 90-day curriculum with optional filters
 * @param params - Optional filters (dayNumber, skillId)
 * @returns Query result with curriculum data
 */
export function useNinetyDayCurriculum(params?: { dayNumber?: number; skillId?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.dayNumber) queryParams.set('dayNumber', params.dayNumber.toString());
  if (params?.skillId) queryParams.set('skillId', params.skillId);

  const queryString = queryParams.toString();
  const url = queryString ? `/api/ninety-day/curriculum?${queryString}` : '/api/ninety-day/curriculum';

  return useQuery<{ curriculum: NinetyDayCurriculum[] }>({
    queryKey: ['/api/ninety-day/curriculum', params],
    queryFn: async () => {
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch curriculum');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch user's 90-day progress
 * @returns Query result with user progress data
 */
export function useNinetyDayProgress() {
  return useQuery<UserNinetyDayProgress>({
    queryKey: ["/api/ninety-day/progress"],
    staleTime: 2 * 60 * 1000, // 2 minutes - refresh more frequently for progress tracking
  });
}

/**
 * Fetch specialized training exercises
 * @param category - Optional category filter
 * @returns Query result with specialized training list
 */
export function useNinetyDaySpecializedTraining(category?: string) {
  const queryString = category ? `?category=${encodeURIComponent(category)}` : '';
  const url = `/api/ninety-day/specialized-training${queryString}`;

  return useQuery<{ trainings: NinetyDaySpecializedTraining[] }>({
    queryKey: ['/api/ninety-day/specialized-training', category],
    queryFn: async () => {
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch specialized training');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch user's training records
 * @param params - Optional filters (dayNumber, limit)
 * @returns Query result with training records
 */
export function useNinetyDayRecords(params?: { dayNumber?: number; limit?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.dayNumber) queryParams.set('dayNumber', params.dayNumber.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `/api/ninety-day/records?${queryString}` : '/api/ninety-day/records';

  return useQuery<{ records: NinetyDayTrainingRecord[] }>({
    queryKey: ['/api/ninety-day/records', params],
    queryFn: async () => {
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch training records');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Complete a training day
 * @returns Mutation hook for completing a day's training
 */
export function useCompleteDay() {
  const queryClient = useQueryClient();

  return useMutation<CompleteDayResponse, Error, CompleteDayRequest>({
    mutationFn: async (data: CompleteDayRequest) => {
      const response = await fetch('/api/ninety-day/complete-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete training day');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['/api/ninety-day/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ninety-day/records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] }); // Update user stats
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Calculate 90-day training statistics from progress data
 * @param progress - User progress data
 * @returns Statistics object
 */
export function useNinetyDayStats(progress?: UserNinetyDayProgress) {
  if (!progress) {
    return {
      completionPercentage: 0,
      daysCompleted: 0,
      daysRemaining: 90,
      currentDay: 1,
      avgSkillProgress: 0,
      totalTime: 0,
      isComplete: false,
    };
  }

  const daysCompleted = progress.completedDays?.length || 0;
  const completionPercentage = Math.round((daysCompleted / 90) * 100);
  const daysRemaining = 90 - daysCompleted;

  // Calculate average skill progress
  const skillProgress = progress.tencoreProgress || {};
  const skillValues = Object.values(skillProgress);
  const avgSkillProgress = skillValues.length > 0
    ? Math.round(skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length)
    : 0;

  return {
    completionPercentage,
    daysCompleted,
    daysRemaining,
    currentDay: progress.currentDay,
    avgSkillProgress,
    totalTime: progress.totalTrainingTime || 0,
    isComplete: daysCompleted >= 90,
  };
}

/**
 * Get current day's curriculum
 * @param currentDay - Current day number
 * @returns Query for current day's curriculum
 */
export function useCurrentDayCurriculum(currentDay: number) {
  return useNinetyDayCurriculum({ dayNumber: currentDay });
}

/**
 * Check if a specific day is completed
 * @param progress - User progress data
 * @param dayNumber - Day to check
 * @returns Whether the day is completed
 */
export function isDayCompleted(progress: UserNinetyDayProgress | undefined, dayNumber: number): boolean {
  if (!progress?.completedDays) return false;
  return progress.completedDays.includes(dayNumber);
}

/**
 * Get skill completion percentage
 * @param progress - User progress data
 * @param skillNumber - Skill number (1-10)
 * @returns Completion percentage (0-100)
 */
export function getSkillProgress(progress: UserNinetyDayProgress | undefined, skillNumber: number): number {
  if (!progress?.tencoreProgress) return 0;
  return progress.tencoreProgress[skillNumber.toString()] || 0;
}
