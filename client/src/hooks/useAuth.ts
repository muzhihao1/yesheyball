import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

export function useAuth() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const queryResult = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: (data) => data ? false : 2000, // Poll every 2s if not authenticated
  });

  const { data: user, isLoading, error, isError, isFetching } = queryResult;

  useEffect(() => {
    if (!isLoading && !isFetching) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isFetching]);

  // Show loading during initial load or when actively fetching
  const shouldShowLoading = isInitialLoad || isLoading || isFetching;

  return {
    user,
    isLoading: shouldShowLoading,
    isAuthenticated: !!user && !error,
  };
}