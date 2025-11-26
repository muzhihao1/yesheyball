import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Flame } from "lucide-react";
import { useDailyGoals } from "@/hooks/useDailyGoals";

export default function Header() {
  const { user, isLoading } = useAuth();
  const { data: goals = [] } = useDailyGoals();

  // Check if any training completed today (at least one goal completed)
  const hasTrainedToday = goals.some((goal) => goal.isCompleted);
  const currentStreak = user?.streak || 0;

  if (isLoading) {
    return (
      <header className="bg-white dark:bg-gray-900 shadow-lg border-b-4 border-billiards-green dark:border-green-600">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/ninety-day-challenge" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-billiards-green dark:bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">三个月一杆清台</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">台球训练系统</p>
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <div className="w-16 h-6 skeleton rounded"></div>
              <div className="w-16 h-6 skeleton rounded"></div>
              <div className="w-10 h-10 skeleton rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (!user) {
    return null;
  }

  const getLevelName = (level: number): string => {
    const levels = [
      "初窥门径", "小有所成", "渐入佳境", "游刃有余", 
      "炉火纯青", "出神入化", "登峰造极", "一代宗师", "无敌天下"
    ];
    return levels[level - 1] || "新手";
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg border-b-4 border-billiards-green dark:border-green-600 sticky top-0 z-50 safe-area-pt">
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/ninety-day-challenge"
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-billiards-green dark:bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="relative w-4 h-4 sm:w-6 sm:h-6 bg-black dark:bg-gray-800 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 rounded-full"></div>
                <div className="relative w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[6px] sm:text-[8px] font-bold text-black">8</span>
                </div>
              </div>
            </div>
            <div className="min-w-0">
              {/* Mobile: Show shortened brand name */}
              <h1 className="text-lg font-bold text-green-700 dark:text-green-400 sm:hidden">90天清台</h1>
              {/* Desktop: Show full brand name */}
              <h1 className="hidden sm:block text-2xl font-bold text-green-700 dark:text-green-400">三个月一杆清台</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">台球训练系统</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-3 sm:space-x-5 lg:space-x-8 flex-shrink-0">
            {/* Streak Fire Indicator */}
            <div className="text-center relative group cursor-pointer">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold flex items-center justify-center transition-all duration-300 ${
                hasTrainedToday
                  ? 'text-orange-500 dark:text-orange-400 scale-110'
                  : 'text-gray-400 dark:text-gray-600'
              }`}>
                <Flame className={`w-6 h-6 sm:w-7 sm:h-7 ${hasTrainedToday ? 'animate-pulse' : ''}`} />
                <span className="ml-1">{currentStreak}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {hasTrainedToday ? '连胜' : '断档'}
              </div>

              {/* Tooltip */}
              {!hasTrainedToday && currentStreak > 0 && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs py-2 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  今天还没训练，别断档！
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45"></div>
                </div>
              )}
            </div>

            {/* EXP Display */}
            <div className="text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-trophy-gold dark:text-yellow-400 flex items-center justify-center">
                <span className="mr-1 text-xl">⭐</span>
                {user?.exp ?? 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">经验值</div>
            </div>

            {/* Level and Username */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 gradient-billiards rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm sm:text-base lg:text-lg font-bold">{user?.level ?? 1}</span>
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-base lg:text-lg font-medium text-green-700 dark:text-green-400">
                  {user?.username || user?.email || "学员"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{getLevelName(user?.level ?? 1)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
