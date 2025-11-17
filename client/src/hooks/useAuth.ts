import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const queryResult = useQuery<User>({
    queryKey: ["/api/auth/user"],
    // 🔒 No retry on 401 - let it fail immediately and show login page
    retry: (failureCount, error: any) => {
      // Don't retry on 401 authentication errors
      if (error?.message?.includes('401')) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for stable sessions
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // 🔧 Disable to prevent unnecessary refetches
    refetchOnMount: true,
    refetchInterval: false,
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