/**
 * Custom hook for fetching and managing daily goals
 */

import { useQuery } from "@tanstack/react-query";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const accessToken = localStorage.getItem('supabase_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

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
        headers: getAuthHeaders(),
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
