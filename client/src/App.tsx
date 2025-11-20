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

  // Handle mobile browser tab switching - refresh auth state when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only refetch if page becomes visible and user was authenticated
      if (!document.hidden && isAuthenticated) {
        const accessToken = localStorage.getItem('supabase_access_token');

        // If token exists, invalidate and refetch user data
        if (accessToken) {
          console.log('[Auth] Page visible - refreshing authentication');
          queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        } else {
          // Token missing - user needs to login again
          console.warn('[Auth] Token missing after page visibility change');
          queryClient.clear();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated]);

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
