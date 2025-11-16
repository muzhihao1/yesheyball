import { useQuery } from "@tanstack/react-query";

export interface DashboardSummary {
  ninetyDayChallenge: {
    currentDay: number;
    totalDays: number;
    completedDays: number;
    startDate: string | null;
    daysSinceStart: number | null;
  };
  skillsLibrary: {
    totalSkills: number;
    masteredSkills: number;
    inProgressSkills: number;
    overallProgress: number;
  };
  practiceField: {
    currentLevel: number;
    currentXP: number;
    nextLevelXP: number;
  };
  abilityScores: {
    accuracy: number;
    spin: number;
    positioning: number;
    power: number;
    strategy: number;
    clearance: number;
  };
}

/**
 * Custom hook to fetch unified dashboard summary
 * Returns aggregated data from all training modules
 */
export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ["/api/v1/dashboard/summary"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
