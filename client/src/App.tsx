import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Header from "@/components/header";
import Navigation from "@/components/navigation";
import { RouteDebugger } from "@/components/RouteDebugger";
import { supabase } from "@/lib/supabase";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import Levels from "@/pages/levels";
import Tasks from "@/pages/tasks";
import Ranking from "@/pages/ranking";
import Diary from "@/pages/diary";
import Profile from "@/pages/profile";
import NinetyDayChallenge from "@/pages/NinetyDayChallenge";

import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - accessible without authentication */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Protected routes - require authentication */}
      <Route path="/" component={isAuthenticated ? NinetyDayChallenge : Login} />
      <Route path="/training" component={isAuthenticated ? Tasks : Login} />
      <Route path="/ninety-day-challenge" component={isAuthenticated ? NinetyDayChallenge : Login} />
      <Route path="/levels" component={isAuthenticated ? Levels : Login} />
      <Route path="/tasks" component={isAuthenticated ? Tasks : Login} />
      <Route path="/growth" component={isAuthenticated ? Ranking : Login} />
      <Route path="/diary" component={isAuthenticated ? Diary : Login} />
      <Route path="/profile" component={isAuthenticated ? Profile : Login} />
      <Route component={isAuthenticated ? NotFound : Login} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Listen to Supabase auth state changes to synchronize React Query state
  // This ensures the app UI updates when Supabase automatically logs out users
  // (e.g., when refresh token expires or user logs out from another tab)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Supabase auth state changed:', event);

        if (event === 'SIGNED_IN') {
          // User signed in - refresh user data
          console.log('[Auth] User signed in, refreshing queries');
          await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        } else if (event === 'SIGNED_OUT') {
          // User signed out - clear all cached data
          console.log('[Auth] User signed out, clearing all queries');
          queryClient.clear();
        } else if (event === 'TOKEN_REFRESHED') {
          // Token was auto-refreshed - optionally log for debugging
          console.log('[Auth] Token refreshed successfully');
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle mobile browser tab switching - refresh auth state when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Only check if page becomes visible
      if (!document.hidden) {
        console.log('[Auth] Page visible - checking session validity');

        // Get current session from Supabase (single source of truth)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Session exists - refresh user data
          console.log('[Auth] Valid session found, refreshing authentication');
          queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        } else {
          // No session - user needs to login again
          console.warn('[Auth] No valid session found');
          queryClient.clear();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-20">
        {isAuthenticated && !isLoading && <Header />}
        
        <main className="pb-4">
          <Router />
        </main>
        
        {isAuthenticated && !isLoading && <Navigation />}
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function TabButton({ href, icon, label }: { href: string; icon: string; label: string }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));
  
  return (
    <a
      href={href}
      className={`py-4 px-3 sm:px-4 border-b-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
        isActive
          ? "border-green-500 text-green-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <span className="mr-1 sm:mr-2">{icon}</span>
      <span className="hidden xs:inline sm:inline">{label}</span>
    </a>
  );
}

export default App;
