import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, Trophy, TrendingUp, Target } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/streak"],
    enabled: !!user,
  });

  const { data: trainingRecords } = useQuery({
    queryKey: ["/api/training-records"],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile-optimized Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-green-100 text-green-700">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                欢迎回来，{user?.firstName || user?.email?.split('@')[0] || '学员'}！
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                继续您的台球训练之旅
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/api/logout'}
            className="text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Quick Stats - Mobile Layout */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-green-600">Lv.1</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">当前等级</p>
            <p className="text-xs text-gray-500">经验值: 0</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-orange-600">{(userStats as any)?.currentStreak || 0}天</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">连续训练</p>
            <p className="text-xs text-gray-500">总训练天数: {(userStats as any)?.totalDays || 0}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-blue-600">{Math.round(((userStats as any)?.totalDays || 0) * 30)}分钟</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">训练时长</p>
            <p className="text-xs text-gray-500">已完成任务: {(trainingRecords as any)?.length || 0}</p>
          </div>
        </div>

        {/* Training Options - Mobile Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">开始训练</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/training">
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-green-400 to-green-600 text-white border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <CardTitle className="text-base">系统训练</CardTitle>
                  </div>
                  <CardDescription className="text-green-100 text-sm">
                    30天系统课程
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/tasks">
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-blue-400 to-blue-600 text-white border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <CardTitle className="text-base">自主训练</CardTitle>
                  </div>
                  <CardDescription className="text-blue-100 text-sm">
                    自由练习模式
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/special">
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-purple-400 to-purple-600 text-white border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <CardTitle className="text-base">特训模式</CardTitle>
                  </div>
                  <CardDescription className="text-purple-100 text-sm">
                    力量与准度
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/growth">
              <Card className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-orange-400 to-orange-600 text-white border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <CardTitle className="text-base">成长记录</CardTitle>
                  </div>
                  <CardDescription className="text-orange-100 text-sm">
                    进度与成就
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Additional Features */}
          <div className="grid grid-cols-1 gap-3 mt-6">
            <Link href="/diary">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                        <Settings className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">训练日记</CardTitle>
                        <CardDescription className="text-sm">
                          记录训练心得和技术感悟
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/analysis">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                        <Settings className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">AI分析</CardTitle>
                        <CardDescription className="text-sm">
                          上传训练视频，获得专业分析
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}