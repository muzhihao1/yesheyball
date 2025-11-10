import { Link, useLocation } from "wouter";
import { BookOpen, Calendar, Target, User, Trophy, TrendingUp } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/levels", label: "关卡地图", icon: Target },
    { path: "/tasks", label: "训练计划", icon: Calendar },
    { path: "/skill-tree", label: "成长路径", icon: TrendingUp },
    { path: "/profile", label: "个人档案", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || (item.path === "/levels" && location === "/");
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive
                  ? "text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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