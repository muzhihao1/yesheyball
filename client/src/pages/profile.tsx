import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  Settings,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  LogOut,
  ChevronRight,
  Star,
  Flame
} from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();
  
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/streak"],
    enabled: !!user,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/user-achievements"],
    enabled: !!user,
  });

  const { data: trainingRecords } = useQuery({
    queryKey: ["/api/training-records"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="bg-green-100 text-green-700">
                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.firstName || user.email?.split('@')[0] || '台球学员'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {user.email}
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
        {/* Training Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-green-600">Lv.1</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">当前等级</p>
            <p className="text-xs text-gray-500">经验值: 0</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-orange-600">{(userStats as any)?.currentStreak || 0}天</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">连续训练</p>
            <p className="text-xs text-gray-500">最长: {(userStats as any)?.longestStreak || 0}天</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-blue-600">{(trainingRecords as any)?.length || 0}</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">训练记录</p>
            <p className="text-xs text-gray-500">总训练: {(userStats as any)?.totalDays || 0}天</p>
          </div>
        </div>

        {/* Achievements Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-600" />
              成就徽章
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {(achievements as any) && (achievements as any).length > 0 ? (
                (achievements as any).map((achievement: any) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Award className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">{achievement.name || '成就'}</p>
                      <p className="text-xs text-gray-600">{achievement.description || '已获得'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>成就</p>
                  <p className="text-sm">已获得</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Growth Path */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-yellow-600" />
              成长路径
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Level Progress */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-green-600" />
                    <span className="font-medium">初窥门径</span>
                    <Badge variant="secondary">启明星</Badge>
                  </div>
                  <span className="text-sm text-gray-600">第 1 级</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">掌握基础击球姿势与瞄准技巧</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>进度</span>
                    <span>0/35 练习</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
              </div>

              {/* Next Levels Preview */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">小有所成</p>
                    <p className="text-xs text-gray-500">练习各种角度的击球技巧</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">启明星</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">渐入佳境</p>
                    <p className="text-xs text-gray-500">掌握基本走位与控球技巧</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">启明星</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              训练统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="font-medium">准度训练</span>
                </div>
                <Badge variant="secondary">
                  {(trainingRecords as any)?.filter((r: any) => r.title?.includes('准度')).length || 0} 次
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">力度训练</span>
                </div>
                <Badge variant="secondary">
                  {(trainingRecords as any)?.filter((r: any) => r.title?.includes('力度')).length || 0} 次
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">总训练时长</span>
                </div>
                <Badge variant="secondary">
                  {Math.round(((userStats as any)?.totalDays || 0) * 30)} 分钟
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(trainingRecords as any) && (trainingRecords as any).length > 0 ? (
              <div className="space-y-3">
                {(trainingRecords as any).slice(0, 3).map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.title}</p>
                      <p className="text-sm text-gray-600">完成时间: {new Date(record.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>还没有训练记录</p>
                <p className="text-sm">开始您的第一次训练吧！</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-gray-600" />
              设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto text-left"
              >
                <span>训练偏好</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto text-left"
              >
                <span>通知设置</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto text-left"
              >
                <span>数据导出</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}