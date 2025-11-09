/**
 * Custom hook for fetching and managing daily goals
 */

import { useQuery } from "@tanstack/react-query";

interface DailyGoal {
  id: number;
  userId: string;
  goalTemplateId: number;
  date: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt: string | null;
  template: {
    id: number;
    type: string;
    description: string;
    difficulty: string;
    rewardXp: number;
  };
}

export function useDailyGoals() {
  return useQuery<DailyGoal[]>({
    queryKey: ["/api/goals/daily"],
    queryFn: async () => {
      const response = await fetch("/api/goals/daily", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch daily goals");
      }

      return response.json();
    },
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
}
