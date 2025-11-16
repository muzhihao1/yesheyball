/**
 * TanStack Query hooks for Ten Core Skills System V3
 *
 * This module provides React hooks for fetching and mutating data
 * related to the Ten Core Skills (十大招) training system.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Helper Functions
// ============================================================================

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const accessToken = localStorage.getItem('supabase_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

// ============================================================================
// Type Definitions (matching backend schema)
// ============================================================================

export interface SkillV3 {
  id: string;              // 'skill_1' to 'skill_10'
  title: string;           // '第一招：基本功'
  description: string | null;
  skillOrder: number;      // 1-10
  iconName: string | null; // 'basics.svg'
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubSkillV3 {
  id: string;              // 'sub_skill_1_1'
  skillId: string;         // 'skill_1'
  title: string;           // '1.1 站位与姿势'
  description: string | null;
  subSkillOrder: number;   // 1, 2, 3...
  unlockCondition: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingUnitV3 {
  id: string;              // 'unit_1_1_1'
  subSkillId: string;      // 'sub_skill_1_1'
  unitType: 'theory' | 'practice' | 'challenge';
  title: string;
  content: {
    text?: string;
    image?: string;
    video?: string;
    keyPoints?: string[];
  } | null;
  goalDescription: string | null;
  xpReward: number;        // Default 10
  unitOrder: number;
  estimatedMinutes: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSkillProgressV3 {
  id: number;
  userId: string;
  skillId: string;
  progressPercentage: number;      // 0-100
  completedSubSkills: number;      // Count of fully completed sub-skills
  totalXpEarned: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUnitCompletion {
  id: number;
  userId: string;
  unitId: string;
  completedAt: string;
  score: number | null;    // 0-100
  notes: string | null;
  xpEarned: number;
}

export interface CurriculumDayUnit {
  id: number;
  dayNumber: number;       // 1-90
  unitId: string;
  unitOrder: number;
  isOptional: boolean;
  createdAt: string;
}

// ============================================================================
// Query Key Factory (for cache management)
// ============================================================================

export const skillsV3Keys = {
  all: ['skills-v3'] as const,
  lists: () => [...skillsV3Keys.all, 'list'] as const,
  list: () => [...skillsV3Keys.lists()] as const,
  details: () => [...skillsV3Keys.all, 'detail'] as const,
  detail: (id: string) => [...skillsV3Keys.details(), id] as const,
  subSkills: (skillId: string) => [...skillsV3Keys.all, 'sub-skills', skillId] as const,
  units: (subSkillId: string) => [...skillsV3Keys.all, 'units', subSkillId] as const,
  userProgress: (userId?: string) => [...skillsV3Keys.all, 'progress', userId] as const,
  userCompletions: (userId?: string) => [...skillsV3Keys.all, 'completions', userId] as const,
  curriculumDay: (dayNumber: number) => [...skillsV3Keys.all, 'curriculum', dayNumber] as const,
};

// ============================================================================
// Query Hooks - Fetch data
// ============================================================================

/**
 * Fetch all skills (十大招)
 *
 * @returns Query result containing array of all 10 skills ordered by skillOrder
 *
 * @example
 * ```tsx
 * const { data: skills, isLoading } = useSkillsV3();
 * if (isLoading) return <div>加载中...</div>;
 * return skills?.map(skill => <SkillCard key={skill.id} skill={skill} />);
 * ```
 */
export function useSkillsV3() {
  return useQuery({
    queryKey: skillsV3Keys.list(),
    queryFn: async () => {
      const response = await fetch('/api/skills-v3');
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }
      const data = await response.json();
      return data.skills as SkillV3[];
    },
  });
}

/**
 * Fetch single skill by ID
 *
 * @param skillId - Skill ID like 'skill_1'
 * @returns Query result containing single skill
 *
 * @example
 * ```tsx
 * const { data: skill } = useSkillV3('skill_1');
 * return <h1>{skill?.title}</h1>;
 * ```
 */
export function useSkillV3(skillId: string) {
  return useQuery({
    queryKey: skillsV3Keys.detail(skillId),
    queryFn: async () => {
      const response = await fetch(`/api/skills-v3/${skillId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch skill');
      }
      const data = await response.json();
      return data.skill as SkillV3;
    },
    enabled: !!skillId,
  });
}

/**
 * Fetch sub-skills for a given skill
 *
 * @param skillId - Skill ID like 'skill_1'
 * @returns Query result containing array of sub-skills
 *
 * @example
 * ```tsx
 * const { data: subSkills } = useSubSkillsV3('skill_1');
 * // Returns: [{ id: 'sub_skill_1_1', title: '1.1 站位与姿势', ... }]
 * ```
 */
export function useSubSkillsV3(skillId: string) {
  return useQuery({
    queryKey: skillsV3Keys.subSkills(skillId),
    queryFn: async () => {
      const response = await fetch(`/api/skills-v3/${skillId}/sub-skills`);
      if (!response.ok) {
        throw new Error('Failed to fetch sub-skills');
      }
      const data = await response.json();
      return data.subSkills as SubSkillV3[];
    },
    enabled: !!skillId,
  });
}

/**
 * Fetch single sub-skill by ID
 *
 * @param subSkillId - Sub-skill ID like 'sub_skill_1_1'
 * @returns Query result containing single sub-skill
 */
export function useSubSkillV3(subSkillId: string) {
  return useQuery({
    queryKey: skillsV3Keys.detail(subSkillId),
    queryFn: async () => {
      const response = await fetch(`/api/sub-skills-v3/${subSkillId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sub-skill');
      }
      const data = await response.json();
      return data.subSkill as SubSkillV3;
    },
    enabled: !!subSkillId,
  });
}

/**
 * Fetch training units for a given sub-skill
 *
 * @param subSkillId - Sub-skill ID like 'sub_skill_1_1'
 * @returns Query result containing array of training units (theory/practice/challenge)
 *
 * @example
 * ```tsx
 * const { data: units } = useTrainingUnitsV3('sub_skill_1_1');
 * // Returns units like: [
 * //   { id: 'unit_1_1_1', unitType: 'theory', title: '理论：核心站位要点', ... },
 * //   { id: 'unit_1_1_2', unitType: 'practice', title: '练习：基础站位', ... },
 * //   { id: 'unit_1_1_3', unitType: 'challenge', title: '挑战：稳定站位30秒', ... }
 * // ]
 * ```
 */
export function useTrainingUnitsV3(subSkillId: string) {
  return useQuery({
    queryKey: skillsV3Keys.units(subSkillId),
    queryFn: async () => {
      const response = await fetch(`/api/sub-skills-v3/${subSkillId}/units`);
      if (!response.ok) {
        throw new Error('Failed to fetch training units');
      }
      const data = await response.json();
      return data.units as TrainingUnitV3[];
    },
    enabled: !!subSkillId,
  });
}

/**
 * Fetch single training unit by ID
 *
 * @param unitId - Unit ID like 'unit_1_1_1'
 * @returns Query result containing single training unit
 */
export function useTrainingUnitV3(unitId: string) {
  return useQuery({
    queryKey: skillsV3Keys.detail(unitId),
    queryFn: async () => {
      const response = await fetch(`/api/training-units-v3/${unitId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch training unit');
      }
      const data = await response.json();
      return data.unit as TrainingUnitV3;
    },
    enabled: !!unitId,
  });
}

/**
 * Fetch user's skill progress (all skills or specific skill)
 *
 * @param skillId - Optional skill ID to filter by single skill
 * @returns Query result containing user's progress records
 *
 * @example
 * ```tsx
 * // Get all skill progress
 * const { data: allProgress } = useUserSkillProgressV3();
 *
 * // Get progress for specific skill
 * const { data: skill1Progress } = useUserSkillProgressV3('skill_1');
 * ```
 */
export function useUserSkillProgressV3(skillId?: string) {
  return useQuery({
    queryKey: skillsV3Keys.userProgress(skillId),
    queryFn: async () => {
      const url = skillId
        ? `/api/user/skills-v3/progress?skillId=${skillId}`
        : '/api/user/skills-v3/progress';
      const response = await fetch(url, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user progress');
      }
      const data = await response.json();
      return data.progress as UserSkillProgressV3[];
    },
  });
}

/**
 * Fetch user's unit completions (all units or specific unit)
 *
 * @param unitId - Optional unit ID to filter by single unit
 * @returns Query result containing user's completion records
 *
 * @example
 * ```tsx
 * // Get all completions
 * const { data: completions } = useUserUnitCompletions();
 *
 * // Check if specific unit is completed
 * const { data: unitCompletion } = useUserUnitCompletions('unit_1_1_1');
 * const isCompleted = unitCompletion && unitCompletion.length > 0;
 * ```
 */
export function useUserUnitCompletions(unitId?: string) {
  return useQuery({
    queryKey: skillsV3Keys.userCompletions(unitId),
    queryFn: async () => {
      const url = unitId
        ? `/api/user/units-v3/completions?unitId=${unitId}`
        : '/api/user/units-v3/completions';
      const response = await fetch(url, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user completions');
      }
      const data = await response.json();
      return data.completions as UserUnitCompletion[];
    },
  });
}

/**
 * Fetch training units assigned to a specific day in 90-day curriculum
 *
 * @param dayNumber - Day number (1-90)
 * @returns Query result containing units for that day
 *
 * @example
 * ```tsx
 * const { data: todayUnits } = useCurriculumDayUnits(1);
 * // Returns units linked to Day 1 of the curriculum
 * ```
 */
export function useCurriculumDayUnits(dayNumber: number) {
  return useQuery({
    queryKey: skillsV3Keys.curriculumDay(dayNumber),
    queryFn: async () => {
      const response = await fetch(`/api/curriculum/${dayNumber}/units`);
      if (!response.ok) {
        throw new Error('Failed to fetch curriculum day units');
      }
      const data = await response.json();
      return data.units as CurriculumDayUnit[];
    },
    enabled: dayNumber >= 1 && dayNumber <= 90,
  });
}

// ============================================================================
// Mutation Hooks - Modify data
// ============================================================================

/**
 * Complete a training unit (marks as done, awards XP, updates progress)
 *
 * @returns Mutation function and status
 *
 * @example
 * ```tsx
 * const completeUnit = useCompleteTrainingUnit();
 *
 * const handleComplete = async () => {
 *   try {
 *     await completeUnit.mutateAsync({
 *       unitId: 'unit_1_1_1',
 *       score: 90,
 *       notes: '练习很顺利'
 *     });
 *     toast.success('单元完成！');
 *   } catch (error) {
 *     toast.error('完成失败');
 *   }
 * };
 *
 * return (
 *   <button
 *     onClick={handleComplete}
 *     disabled={completeUnit.isPending}
 *   >
 *     {completeUnit.isPending ? '保存中...' : '完成训练'}
 *   </button>
 * );
 * ```
 */
export function useCompleteTrainingUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      unitId: string;
      score?: number;
      notes?: string;
    }) => {
      const response = await fetch(`/api/training-units-v3/${params.unitId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: params.score,
          notes: params.notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete training unit');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: skillsV3Keys.userCompletions() });
      queryClient.invalidateQueries({ queryKey: skillsV3Keys.userProgress() });

      // Optionally update specific unit completion cache
      queryClient.invalidateQueries({
        queryKey: skillsV3Keys.userCompletions(variables.unitId)
      });
    },
  });
}

// ============================================================================
// Utility Hooks - Computed data
// ============================================================================

/**
 * Get completion status and statistics for a specific sub-skill
 *
 * @param subSkillId - Sub-skill ID to check
 * @returns Computed completion statistics
 *
 * @example
 * ```tsx
 * const stats = useSubSkillCompletionStats('sub_skill_1_1');
 *
 * if (stats.isLoading) return <Spinner />;
 *
 * return (
 *   <div>
 *     <Progress value={stats.completionPercentage} />
 *     <p>{stats.completedCount} / {stats.totalCount} 单元已完成</p>
 *     {stats.isFullyCompleted && <Badge>✅ 已精通</Badge>}
 *   </div>
 * );
 * ```
 */
export function useSubSkillCompletionStats(subSkillId: string) {
  const { data: units, isLoading: unitsLoading } = useTrainingUnitsV3(subSkillId);
  const { data: completions, isLoading: completionsLoading } = useUserUnitCompletions();

  const isLoading = unitsLoading || completionsLoading;

  if (isLoading || !units || !completions) {
    return {
      isLoading,
      totalCount: 0,
      completedCount: 0,
      completionPercentage: 0,
      isFullyCompleted: false,
      remainingUnits: [],
    };
  }

  const unitIds = units.map(u => u.id);
  const completedUnitIds = new Set(
    completions.filter(c => unitIds.includes(c.unitId)).map(c => c.unitId)
  );

  const completedCount = completedUnitIds.size;
  const totalCount = units.length;
  const completionPercentage = totalCount > 0 ? Math.floor((completedCount / totalCount) * 100) : 0;
  const isFullyCompleted = completedCount === totalCount && totalCount > 0;
  const remainingUnits = units.filter(u => !completedUnitIds.has(u.id));

  return {
    isLoading: false,
    totalCount,
    completedCount,
    completionPercentage,
    isFullyCompleted,
    remainingUnits,
  };
}

/**
 * Get overall completion statistics for a skill (across all sub-skills)
 *
 * @param skillId - Skill ID like 'skill_1'
 * @returns Computed skill-level statistics
 *
 * @example
 * ```tsx
 * const stats = useSkillCompletionStats('skill_1');
 *
 * return (
 *   <Card>
 *     <h2>{skill.title}</h2>
 *     <Progress value={stats.overallPercentage} />
 *     <p>{stats.completedSubSkills} / {stats.totalSubSkills} 子技能已掌握</p>
 *     <p>总XP: {stats.totalXP}</p>
 *   </Card>
 * );
 * ```
 */
export function useSkillCompletionStats(skillId: string) {
  const { data: subSkills, isLoading: subSkillsLoading } = useSubSkillsV3(skillId);
  const { data: progress, isLoading: progressLoading } = useUserSkillProgressV3(skillId);

  const isLoading = subSkillsLoading || progressLoading;

  if (isLoading || !subSkills) {
    return {
      isLoading,
      totalSubSkills: 0,
      completedSubSkills: 0,
      overallPercentage: 0,
      totalXP: 0,
      isFullyCompleted: false,
    };
  }

  const progressRecord = progress?.[0];
  const totalSubSkills = subSkills.length;
  const completedSubSkills = progressRecord?.completedSubSkills || 0;
  const overallPercentage = progressRecord?.progressPercentage || 0;
  const totalXP = progressRecord?.totalXpEarned || 0;
  const isFullyCompleted = completedSubSkills === totalSubSkills && totalSubSkills > 0;

  return {
    isLoading: false,
    totalSubSkills,
    completedSubSkills,
    overallPercentage,
    totalXP,
    isFullyCompleted,
  };
}
