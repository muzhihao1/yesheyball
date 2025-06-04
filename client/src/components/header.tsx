import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export default function Header() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
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
                <h1 className="text-2xl font-bold text-green-700">台球大师之路</h1>
                <p className="text-sm text-gray-600">中式八球训练系统</p>
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
              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full"></div>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-green-700 truncate">台球大师之路</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">中式八球训练系统</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-shrink-0">
            <div className="text-center hidden sm:block">
              <div className="text-sm sm:text-lg font-bold text-red-500 flex items-center justify-center">
                <span className="mr-1">🔥</span>
                {user.streak}
              </div>
              <div className="text-xs text-gray-500">连续天数</div>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-lg font-bold text-trophy-gold flex items-center justify-center">
                <span className="mr-1">⭐</span>
                {user.exp}
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">经验值</div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-billiards rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">{user.level}</span>
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-green-700">{user.username}</div>
                <div className="text-xs text-gray-500">{getLevelName(user.level)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
