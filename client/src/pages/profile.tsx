import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { AchievementGrid } from "@/components/AchievementGrid";
import { TrainingTrendChart } from "@/components/TrainingTrendChart";
import { SkillRadarChart } from "@/components/SkillRadarChart";
import { useAbilityScores } from "@/hooks/useAbilityScores";
import AbilityRadarChart from "@/components/ninety-day/AbilityRadarChart";
import AbilityScoreBars from "@/components/AbilityScoreBars";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { NinetyDayChallengeCard } from "@/components/dashboard/NinetyDayChallengeCard";
import { SkillsLibraryCard } from "@/components/dashboard/SkillsLibraryCard";
import { PracticeFieldCard } from "@/components/dashboard/PracticeFieldCard";
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
  Flame,
  LayoutDashboard
} from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();

  // Fetch unified dashboard summary (for 90-day challenge, skills library, practice field)
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboardSummary();

  // Fetch ability scores (single source of truth)
  const { data: abilityScores, isLoading: isLoadingAbilityScores } = useAbilityScores();

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/streak"],
    enabled: !!user,
  });

  const { data: allAchievements } = useQuery({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements } = useQuery({
    queryKey: ["/api/user-achievements"],
    enabled: !!user,
  });

  const { data: trainingRecords } = useQuery({
    queryKey: ["/api/training-records"],
    enabled: !!user,
  });

  const { data: trendData } = useQuery({
    queryKey: ["/api/user/stats/trend"],
    enabled: !!user,
  });

  const { data: skillsData } = useQuery({
    queryKey: ["/api/user/stats/skills"],
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
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              } catch (error) {
                console.error('Logout failed:', error);
                // Redirect to login anyway
                window.location.href = '/login';
              }
            }}
            className="text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Dashboard Overview Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-purple-600" />
            训练总览
          </h2>

          {isLoadingDashboard ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">加载数据中...</p>
            </div>
          ) : dashboardData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <NinetyDayChallengeCard data={dashboardData.ninetyDayChallenge} />
              <SkillsLibraryCard data={dashboardData.skillsLibrary} />
              <PracticeFieldCard data={dashboardData.practiceField} />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>无法加载仪表板数据</p>
            </div>
          )}
        </div>

        {/* Training Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg font-bold text-green-600">Lv.{user.level}</div>
            <p className="text-xs text-gray-600 dark:text-gray-300">当前等级</p>
            <p className="text-xs text-gray-500">经验值: {user.exp}</p>
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
            {allAchievements && userAchievements ? (
              <AchievementGrid
                allAchievements={allAchievements as any}
                userAchievements={userAchievements as any}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>加载成就中...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ability Analysis Section - 能力分析 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            能力分析
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Radar Chart - Hidden on mobile */}
            <div className="hidden lg:block">
              <AbilityRadarChart
                scores={abilityScores}
                isLoading={isLoadingAbilityScores}
              />
            </div>

            {/* Right: Detailed Score Bars - Full width on mobile */}
            <div className="lg:col-span-1">
              <AbilityScoreBars
                scores={abilityScores}
                isLoading={isLoadingAbilityScores}
              />
            </div>
          </div>
        </div>

        {/* Data Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TrainingTrendChart data={trendData as any || []} />
          <SkillRadarChart skills={skillsData as any || []} />
        </div>

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
              {/* All 8 Level Stages */}
              {[
                { level: 1, name: "初窥门径", category: "启明星", desc: "掌握基础击球姿势与瞄准技巧", total: 35 },
                { level: 2, name: "小有所成", category: "启明星", desc: "练习各种角度的击球技巧", total: 40 },
                { level: 3, name: "渐入佳境", category: "启明星", desc: "掌握基本走位与控球技巧", total: 45 },
                { level: 4, name: "炉火纯青", category: "超新星", desc: "提升高难度球的控制能力", total: 60 },
                { level: 5, name: "登堂入室", category: "超新星", desc: "精通复杂局面的处理技巧", total: 65 },
                { level: 6, name: "超群绝伦", category: "超新星", desc: "掌握顶级竞技技巧", total: 70 },
                { level: 7, name: "登峰造极", category: "智子星", desc: "达到职业级别的技术水平", total: 55 },
                { level: 8, name: "出神入化", category: "智子星", desc: "成为台球大师", total: 55 }
              ].map((stage, index) => {
                const isCurrentLevel = stage.level === (user.level || 1);
                const isCompleted = stage.level < (user.level || 1);
                const isLocked = stage.level > (user.level || 1);

                // Get completed exercises for this level
                const completedExercises = (user as any)?.completedExercises?.[stage.level] || 0;
                const progress = stage.total > 0 ? Math.min((completedExercises / stage.total) * 100, isCompleted ? 100 : 95) : 0;

                if (isCurrentLevel) {
                  // Current level - detailed card
                  return (
                    <div key={stage.level} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-green-600" />
                          <span className="font-medium">{stage.name}</span>
                          <Badge variant="secondary">{stage.category}</Badge>
                        </div>
                        <span className="text-sm text-gray-600">第 {stage.level} 级</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{stage.desc}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>进度</span>
                          <span>{completedExercises}/{stage.total} 练习</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: `${progress}%`}}></div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Other levels - compact card
                  return (
                    <div
                      key={stage.level}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isCompleted
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <Trophy className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-medium">{stage.level}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-700'}`}>
                          {stage.name}
                        </p>
                        <p className="text-xs text-gray-500">{stage.desc}</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">{stage.category}</Badge>
                    </div>
                  );
                }
              })}
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