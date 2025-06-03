import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Levels from "@/pages/levels-new";
import Tasks from "@/pages/tasks";
import Test from "@/pages/test";
import Diary from "@/pages/diary";
import Profile from "@/pages/profile";
import AdaptiveLearning from "@/pages/adaptive-learning";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Levels} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/test" component={Test} />
      <Route path="/diary" component={Diary} />
      <Route path="/adaptive" component={AdaptiveLearning} />
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
          
          {/* Tab Navigation */}
          <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex space-x-8">
                <TabButton href="/tasks" icon="📝" label="每日训练" />
                <TabButton href="/" icon="🗺️" label="关卡地图" />
                <TabButton href="/adaptive" icon="🧠" label="智能学习" />
                <TabButton href="/test" icon="🏆" label="等级考核" />
                <TabButton href="/diary" icon="📖" label="练习日记" />
                <TabButton href="/profile" icon="👤" label="个人资料" />
              </div>
            </div>
          </nav>
          
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
      className={`py-4 px-2 border-b-2 font-medium transition-colors ${
        isActive
          ? "border-billiards-green text-green-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </a>
  );
}

// Need to import useLocation at the top level
import { useLocation } from "wouter";

export default App;
