import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
}

export default function Header() {
  const { user, isLoading } = useAuth();

  const { data: streakData } = useQuery<StreakData>({
    queryKey: ["/api/user/streak"],
  });

  if (isLoading) {
    return (
      <header className="bg-white shadow-lg border-b-4 border-billiards-green">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-billiards-green rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-700">三个月一杆清台</h1>
                <p className="text-sm text-gray-600">台球训练系统</p>
              </div>
            </div>
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
    <header className="bg-white shadow-lg border-b-4 border-billiards-green sticky top-0 z-50 safe-area-pt">
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-billiards-green rounded-full flex items-center justify-center flex-shrink-0">
              <div className="relative w-4 h-4 sm:w-6 sm:h-6 bg-black rounded-full flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-full"></div>
                <div className="relative w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[6px] sm:text-[8px] font-bold text-black">8</span>
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-green-700 truncate">三个月一杆清台</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">台球训练系统</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-5 lg:space-x-8 flex-shrink-0">
            <div className="text-center hidden sm:block">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-500 flex items-center justify-center">
                <span className="mr-1 text-xl">🔥</span>
                {streakData?.currentStreak || 0}
              </div>
              <div className="text-sm text-gray-500">连续天数</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-trophy-gold flex items-center justify-center">
                <span className="mr-1 text-xl">⭐</span>
                {user.exp}
              </div>
              <div className="text-sm text-gray-500 hidden sm:block">经验值</div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 gradient-billiards rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm sm:text-base lg:text-lg font-bold">{user.level}</span>
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-base lg:text-lg font-medium text-green-700">{user.username}</div>
                <div className="text-sm text-gray-500">{getLevelName(user.level)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
