import { useQuery } from "@tanstack/react-query";
import { User, Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getLevelName, calculateLevelProgress, getExpForNextLevel } from "@/lib/tasks";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  if (userLoading || tasksLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-48 h-8 skeleton mx-auto mb-4"></div>
          <div className="w-64 h-6 skeleton mx-auto"></div>
        </div>
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-64 h-20 skeleton rounded-lg mr-8"></div>
              <div className="w-16 h-16 skeleton rounded-full"></div>
              <div className="w-64 h-20 skeleton rounded-lg ml-8"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user || !tasks) {
    return <div className="text-center py-8">数据加载失败</div>;
  }

  const levelProgress = calculateLevelProgress(user.exp, user.level);
  const expForNext = getExpForNextLevel(user.level);
  const currentLevelExp = (user.level - 1) * 150;
  const expInLevel = user.exp - currentLevelExp;

  const levels = [
    { 
      level: 1, 
      name: "初窥门径", 
      description: "学习基础握杆和瞄准",
      unlocked: user.level >= 1,
      completed: user.level > 1,
      current: user.level === 1,
      tasks: tasks.filter(t => t.level === 1)
    },
    { 
      level: 2, 
      name: "小有所成", 
      description: "掌握基本击球技巧",
      unlocked: user.level >= 2,
      completed: user.level > 2,
      current: user.level === 2,
      tasks: tasks.filter(t => t.level === 2)
    },
    { 
      level: 3, 
      name: "渐入佳境", 
      description: "学习复杂走位技巧",
      unlocked: user.level >= 3,
      completed: user.level > 3,
      current: user.level === 3,
      tasks: tasks.filter(t => t.level === 3)
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-700 mb-2">训练进度地图</h2>
        <p className="text-gray-600">通过每日训练，逐步提升你的台球技艺</p>
        <div className="inline-flex items-center bg-green-100 rounded-full px-4 py-2 mt-4">
          <span className="mr-2">📅</span>
          <span className="text-green-700 font-medium">{new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* Progress Path */}
      <div className="relative mb-12">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200 z-0"></div>
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-billiards-green z-10 transition-all duration-1000"
          style={{ height: `${Math.min(100, (user.level / levels.length) * 100)}%` }}
        ></div>

        <div className="space-y-12">
          {levels.map((levelData, index) => (
            <div key={levelData.level} className="relative flex items-center">
              {/* Left content for odd levels */}
              {index % 2 === 0 && (
                <div className="flex-1 text-right pr-8">
                  <Card className={`inline-block max-w-xs ${levelData.unlocked ? 'opacity-100' : 'opacity-60'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-green-700">{levelData.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{levelData.description}</p>
                      <div className="flex items-center justify-between">
                        {levelData.completed ? (
                          <div className="flex items-center text-green-600">
                            <span className="mr-1">✅</span>
                            <span className="text-sm">已完成</span>
                          </div>
                        ) : levelData.current ? (
                          <Badge variant="default" className="bg-yellow-500">
                            当前关卡
                          </Badge>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <span className="mr-1">🔒</span>
                            <span className="text-sm">未解锁</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {levelData.tasks.length} 个任务
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Center node */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center z-20 shadow-lg border-4 border-white ${
                levelData.completed 
                  ? 'gradient-billiards' 
                  : levelData.current 
                    ? 'gradient-trophy animate-pulse' 
                    : 'bg-gray-300'
              }`}>
                {levelData.completed ? (
                  <span className="text-white text-xl">✓</span>
                ) : levelData.current ? (
                  <span className="text-white text-xl font-bold">{levelData.level}</span>
                ) : (
                  <span className="text-white text-xl">🔒</span>
                )}
              </div>

              {/* Right content for even levels */}
              {index % 2 === 1 && (
                <div className="flex-1 text-left pl-8">
                  <Card className={`inline-block max-w-xs ${levelData.unlocked ? 'opacity-100' : 'opacity-60'}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-green-700">{levelData.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{levelData.description}</p>
                      <div className="flex items-center justify-between">
                        {levelData.completed ? (
                          <div className="flex items-center text-green-600">
                            <span className="mr-1">✅</span>
                            <span className="text-sm">已完成</span>
                          </div>
                        ) : levelData.current ? (
                          <Badge variant="default" className="bg-yellow-500">
                            当前关卡
                          </Badge>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <span className="mr-1">🔒</span>
                            <span className="text-sm">未解锁</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {levelData.tasks.length} 个任务
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Empty side for spacing */}
              {index % 2 === 0 ? (
                <div className="flex-1 pl-8"></div>
              ) : (
                <div className="flex-1 pr-8"></div>
              )}
            </div>
          ))}
        </div>

        {/* More levels placeholder */}
        <div className="text-center py-8 mt-8">
          <span className="text-gray-400 text-sm">更多关卡等待解锁...</span>
        </div>
      </div>

      {/* Level Progress Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>当前等级进度</span>
            <Badge variant="outline">{getLevelName(user.level)}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>等级 {user.level}</span>
              <span>{expInLevel}/{expForNext - currentLevelExp} 经验值</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <p className="text-xs text-gray-600 text-center">
              还需 {expForNext - user.exp} 经验值升至等级 {user.level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Challenge Banner */}
      <Card className="gradient-billiards text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">今日挑战</h3>
              <p className="text-green-100">完成3个训练任务，获得经验值奖励</p>
            </div>
            <Button 
              onClick={() => setLocation("/tasks")}
              variant="secondary"
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50"
            >
              开始训练
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
