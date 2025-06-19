import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

export function useAuth() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastAuthCheck, setLastAuthCheck] = useState(0);
  
  const queryResult = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (unauthorized) - user needs to log in
      if (error?.message?.includes('401')) {
        return false;
      }
      // Retry network errors up to 3 times
      return failureCount < 3;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for stable sessions
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Only poll if user is not authenticated and we haven't checked recently
    refetchInterval: (data) => {
      const now = Date.now();
      if (data) return false; // Don't poll if authenticated
      if (now - lastAuthCheck < 5000) return false; // Don't poll too frequently
      setLastAuthCheck(now);
      return 10000; // Poll every 10s when not authenticated
    },
  });

  const { data: user, isLoading, error, isError, isFetching } = queryResult;

  useEffect(() => {
    if (!isLoading && !isFetching) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isFetching]);

  // Only show loading during true initial load
  const shouldShowLoading = isInitialLoad && isLoading;

  return {
    user,
    isLoading: shouldShowLoading,
    isAuthenticated: !!user && !isError,
  };
}