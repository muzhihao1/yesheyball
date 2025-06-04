import { Link, useLocation } from "wouter";
import { BookOpen, Calendar, Target, User, Dumbbell } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/levels", label: "关卡地图", icon: Target },
    { path: "/tasks", label: "训练计划", icon: Calendar },
    { path: "/diary", label: "训练日记", icon: BookOpen },
    { path: "/profile", label: "个人档案", icon: User },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.path === "/levels" && location === "/");
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}