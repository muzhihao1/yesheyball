import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const queryResult = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: async (failureCount, error: any) => {
      // On 401, try to refresh Supabase token
      if (error?.message?.includes('401')) {
        if (failureCount === 0) {
          console.log('🔄 401 detected, attempting token refresh...');
          try {
            // Try to refresh the session with Supabase
            const { data, error: refreshError } = await supabase.auth.refreshSession();

            if (!refreshError && data.session) {
              console.log('✅ Token refreshed successfully');
              // Update localStorage with new tokens
              localStorage.setItem('supabase_access_token', data.session.access_token);
              localStorage.setItem('supabase_refresh_token', data.session.refresh_token);
              return true; // Retry the query with new token
            } else {
              console.log('❌ Token refresh failed:', refreshError?.message);
            }
          } catch (refreshErr) {
            console.error('❌ Token refresh error:', refreshErr);
          }
        }
        return false; // Don't retry after first attempt or if refresh failed
      }
      // Retry network errors up to 3 times
      return failureCount < 3;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for stable sessions
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // 🔧 Critical fix: Disable auto polling to prevent 401 storms after serverless cold starts
    refetchInterval: false,
  });

  const { data: user, isLoading, error, isError, isFetching } = queryResult;

  useEffect(() => {
    if (!isLoading && !isFetching) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isFetching]);

  // 🔧 Critical fix: On mount, check if we have tokens and refresh if needed
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('supabase_access_token');
      const refreshToken = localStorage.getItem('supabase_refresh_token');

      // If no access token but we have refresh token, try to refresh
      if (!accessToken && refreshToken) {
        console.log('🔄 No access token found, attempting to restore session...');
        try {
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
          });

          if (!error && data.session) {
            console.log('✅ Session restored successfully');
            localStorage.setItem('supabase_access_token', data.session.access_token);
            localStorage.setItem('supabase_refresh_token', data.session.refresh_token);
          } else {
            console.log('❌ Session restore failed:', error?.message);
            // Clear invalid tokens
            localStorage.removeItem('supabase_access_token');
            localStorage.removeItem('supabase_refresh_token');
          }
        } catch (err) {
          console.error('❌ Session restore error:', err);
          localStorage.removeItem('supabase_access_token');
          localStorage.removeItem('supabase_refresh_token');
        }
      }
    };

    initializeAuth();
  }, []); // Run only once on mount

  // Only show loading during true initial load
  const shouldShowLoading = isInitialLoad && isLoading;

  return {
    user,
    isLoading: shouldShowLoading,
    isAuthenticated: !!user && !isError,
  };
}