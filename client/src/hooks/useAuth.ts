import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";
import { getQueryFn } from "@/lib/queryClient";

// Frontend-friendly user shape (允许后端缺省部分字段，但字段存在于类型中，便于消费端使用)
type AuthUser = {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  username?: string | null;
  level?: number | null;
  exp?: number | null;
  streak?: number | null;
  longestStreak?: number | null;
  onboardingCompleted?: boolean | null;
};

export function useAuth() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // 🔍 LOG: Track hook initialization
  useEffect(() => {
    const hookId = Math.random().toString(36).substr(2, 9);
    console.log(`[useAuth ${hookId}] Hook initialized`);

    return () => {
      console.log(`[useAuth ${hookId}] Hook cleanup`);
    };
  }, []);

  // Wait for Supabase session to be resolved once before firing queries
  useEffect(() => {
    let active = true;
    console.log('[useAuth] Starting session check...');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) {
        console.log('[useAuth] Session check aborted (inactive)');
        return;
      }
      console.log('[useAuth] Session check complete:', { hasSession: !!session });
      setHasSession(!!session);
      setSessionChecked(true);
      // If没有session，后续查询会返回401，不必一直loading
      if (!session) {
        setIsInitialLoad(false);
      }
    }).catch((err) => {
      if (active) {
        console.error('[useAuth] Session check failed:', err);
        setSessionChecked(true);
        setIsInitialLoad(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('[useAuth] Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
        setSessionChecked(true);
      }
    });

    return () => {
      console.log('[useAuth] Cleaning up session subscription');
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fallback timer to avoid being stuck on loading if query never resolves
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const queryResult = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    // 等待 Supabase session 检查完成后即可运行
    enabled: sessionChecked,
    // ✅ Use default queryFn from queryClient which automatically includes Authorization header
    // on401: "returnNull" - returns null instead of throwing on 401
    queryFn: getQueryFn<AuthUser | null>({ on401: "returnNull" }),
    // 🔒 No retry to prevent infinite loops on login page
    retry: false,
    // ⏰ Longer staleTime to reduce unnecessary refetches
    // Supabase access tokens typically expire after 3600 seconds (1 hour)
    // Setting staleTime to 30 minutes ensures we revalidate before expiry
    staleTime: 30 * 60 * 1000, // 30 minutes - safely below JWT expiry
    gcTime: 60 * 60 * 1000, // 60 minutes
    // 🚫 Disable refetch to prevent request storms on login page
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const { data: user, status, isFetching, isError } = queryResult;

  // Ready means query已成功或失败（401等），不再处于挂起状态
  const isReady = sessionChecked && (status === 'success' || status === 'error');

  useEffect(() => {
    if (isReady && !isFetching) {
      console.log('[useAuth] Setting isInitialLoad to false');
      setIsInitialLoad(false);
    }
  }, [isReady, isFetching]);

  // Only show loading during true initial load
  const shouldShowLoading = !isReady || (isInitialLoad && isFetching);

  // 🔍 LOG: Track state changes
  useEffect(() => {
    console.log('[useAuth] State:', {
      sessionChecked,
      status,
      isReady,
      isFetching,
      isInitialLoad,
      shouldShowLoading,
      hasUser: !!user,
      isAuthenticated: !!user && !isError
    });
  }, [sessionChecked, status, isReady, isFetching, isInitialLoad, shouldShowLoading, user, isError]);

  return {
    user,
    isLoading: shouldShowLoading,
    isAuthenticated: !!user && !isError,
  };
}
