import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import Navigation from "@/components/navigation";
import Landing from "@/pages/Landing";
import Home from "@/pages/home";
import Levels from "@/pages/levels-new";
import Tasks from "@/pages/tasks";
import Ranking from "@/pages/ranking";
import Diary from "@/pages/diary";
import Profile from "@/pages/profile";

import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/training" component={Levels} />
          <Route path="/levels" component={Levels} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/growth" component={Ranking} />
          <Route path="/diary" component={Diary} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

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
