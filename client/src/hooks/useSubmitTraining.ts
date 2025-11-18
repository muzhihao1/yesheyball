/**
 * Custom hook for submitting 90-day challenge training records
 * Uses TanStack Query's useMutation for optimistic updates and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SubmitNinetyDayTrainingRecord } from '@shared/schema';

interface TrainingRecordResponse {
  data: {
    id: number;
    userId: string;
    dayNumber: number;
    successRate: number | null;
    scoreChanges: Record<string, number>;
    completedAt: string;
    durationMinutes: number | null;
    trainingType: string;
    notes: string | null;
    trainingStats: any;
    achievedTarget: boolean | null;
  };
}

interface ErrorResponse {
  message: string;
  errors?: Array<{ path: string; message: string }>;
}

/**
 * Add Authorization header with JWT token for authenticated requests
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const accessToken = localStorage.getItem('supabase_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
}

export function useSubmitTraining() {
  const queryClient = useQueryClient();

  return useMutation<TrainingRecordResponse, Error, SubmitNinetyDayTrainingRecord>({
    mutationFn: async (data: SubmitNinetyDayTrainingRecord) => {
      const response = await fetch('/api/ninety-day/records', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include', // Include cookies for session fallback auth
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();

        // Handle specific error cases
        if (response.status === 409) {
          throw new Error(errorData.message || '该天已提交训练记录，无法重复提交');
        }

        if (response.status === 400 && errorData.errors) {
          // Format validation errors
          const errorMessages = errorData.errors.map(e => `${e.path}: ${e.message}`).join(', ');
          throw new Error(`数据验证失败: ${errorMessages}`);
        }

        throw new Error(errorData.message || '提交训练记录失败，请重试');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/ninety-day/records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/dashboard/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/streak'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ninety-day/progress'] });

      console.log(`✅ Training record submitted successfully: Day ${data.data.dayNumber}`);
    },
    onError: (error) => {
      console.error('❌ Failed to submit training record:', error.message);
    },
  });
}
