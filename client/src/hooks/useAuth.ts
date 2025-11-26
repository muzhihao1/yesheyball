import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";

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
};

export function useAuth() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Wait for Supabase session to be resolved once before firing queries
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setSessionChecked(true);
      // If没有session，后续查询会返回401，不必一直loading
      if (!session) {
        setIsInitialLoad(false);
      }
    }).catch(() => {
      if (active) {
        setSessionChecked(true);
        setIsInitialLoad(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
        setSessionChecked(true);
      }
    });

    return () => {
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

  const queryResult = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    enabled: sessionChecked, // 等待Supabase session确定后再发请求
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) {
        throw new Error(`Auth fetch failed: ${res.status}`);
      }
      return res.json();
    },
    // 🔒 No retry on 401 - let it fail immediately and show login page
    retry: (failureCount, error: any) => {
      // Don't retry on 401 authentication errors
      if (error?.message?.includes('401')) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    // ⏰ Short staleTime to prevent using expired tokens
    // Supabase access tokens typically expire after 3600 seconds (1 hour)
    // Setting staleTime to 30 minutes ensures we revalidate before expiry
    staleTime: 30 * 60 * 1000, // 30 minutes - safely below JWT expiry
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: true, // ✅ Enable to check auth on focus (important for mobile)
    refetchOnMount: true,
    refetchInterval: false,
  });

  const { data: user, status, isFetching, isError } = queryResult;

  // Ready means query已成功或失败（401等），不再处于挂起状态
  const isReady = sessionChecked && (status === 'success' || status === 'error');

  useEffect(() => {
    if (isReady && !isFetching) {
      setIsInitialLoad(false);
    }
  }, [isReady, isFetching]);

  // Only show loading during true initial load
  const shouldShowLoading = !isReady || (isInitialLoad && isFetching);

  return {
    user,
    isLoading: shouldShowLoading,
    isAuthenticated: !!user && !isError,
  };
}
