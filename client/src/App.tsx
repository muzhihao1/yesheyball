import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Navigation from "@/components/navigation";
import Levels from "@/pages/levels-new";
import Tasks from "@/pages/tasks";
import Training from "@/pages/training";
import Diary from "@/pages/diary";
import Profile from "@/pages/profile";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Levels} />
      <Route path="/levels" component={Levels} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/training" component={Training} />
      <Route path="/diary" component={Diary} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
          <Header />
          
          <Navigation />
          
          <main>
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
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

// Need to import useLocation at the top level
import { useLocation } from "wouter";

export default App;
