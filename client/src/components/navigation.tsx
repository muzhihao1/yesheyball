import { Link, useLocation } from "wouter";
import { BookOpen, Calendar, Target, User, Rocket, Trophy } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/ninety-day-challenge", label: "挑战", icon: Rocket },
    { path: "/tasks", label: "技能库", icon: BookOpen },
    { path: "/ranking", label: "排行榜", icon: Trophy },
    { path: "/profile", label: "我的", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-pb shadow-lg">
      <div className="flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || (item.path === "/ninety-day-challenge" && location === "/");

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}