import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getLevelName, calculateLevelProgress, getExpForNextLevel, formatDuration, ACHIEVEMENT_ICONS } from "@/lib/tasks";

interface UserStats {
  level: number;
  exp: number;
  streak: number;
  totalDays: number;
  completedTasks: number;
  totalTime: number;
  achievements: string[];
  diaryCount: number;
  averageRating: number;
}

export default function Profile() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  if (userLoading || statsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-48 h-8 skeleton mx-auto mb-4"></div>
          <div className="w-64 h-6 skeleton mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-96 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user || !stats) {
    return <div className="text-center py-8">数据加载失败</div>;
  }

  const levelProgress = calculateLevelProgress(user.exp, user.level);
  const expForNext = getExpForNextLevel(user.level);
  const currentLevelExp = (user.level - 1) * 150;
  const expInLevel = user.exp - currentLevelExp;

  const allAchievements = [
    { name: "新手上路", unlocked: stats.completedTasks >= 1, description: "完成第一个训练任务" },
    { name: "连续打卡", unlocked: stats.streak >= 3, description: "连续训练3天" },
    { name: "精准射手", unlocked: stats.averageRating >= 4, description: "平均评分达到4星" },
    { name: "勤奋练习", unlocked: stats.totalTime >= 600, description: "累计训练10小时" },
    { name: "完美表现", unlocked: stats.completedTasks >= 50, description: "完成50个训练任务" },
    { name: "台球大师", unlocked: stats.level >= 5, description: "达到等级5" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-700 mb-2">个人资料</h2>
        <p className="text-gray-600">查看你的训练统计和成就</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* User Info Card */}
        <Card>
          <CardContent className="text-center p-6">
            <div className="w-20 h-20 gradient-billiards rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">👤</span>
            </div>
            <h3 className="text-xl font-bold text-green-700 mb-1">{user.username}</h3>
            <p className="text-gray-600 mb-4">台球爱好者</p>
            
            <div className="bg-green-50 rounded-lg p-3 mb-4">
              <div className="text-lg font-bold text-green-700">等级 {user.level}</div>
              <div className="text-sm text-gray-600">{getLevelName(user.level)}</div>
            </div>
            
            <Button className="w-full bg-billiards-green hover:bg-green-700">
              编辑资料
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">训练统计</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <span className="mr-3 text-red-500">🔥</span>
                <span className="text-gray-700">连续打卡</span>
              </div>
              <span className="font-bold text-green-600">{stats.streak}天</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <span className="mr-3 text-blue-500">📅</span>
                <span className="text-gray-700">总训练天数</span>
              </div>
              <span className="font-bold text-green-600">{stats.totalDays}天</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <span className="mr-3 text-green-500">✅</span>
                <span className="text-gray-700">完成任务</span>
              </div>
              <span className="font-bold text-green-600">{stats.completedTasks}个</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <span className="mr-3 text-yellow-500">⭐</span>
                <span className="text-gray-700">总经验值</span>
              </div>
              <span className="font-bold text-green-600">{stats.exp}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <span className="mr-3 text-purple-500">🕐</span>
                <span className="text-gray-700">训练时长</span>
              </div>
              <span className="font-bold text-green-600">{formatDuration(stats.totalTime)}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <span className="mr-3 text-orange-500">📝</span>
                <span className="text-gray-700">日记篇数</span>
              </div>
              <span className="font-bold text-green-600">{stats.diaryCount}篇</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">成就徽章</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {allAchievements.map((achievement) => (
                <div 
                  key={achievement.name}
                  className={`text-center p-3 rounded-lg ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-b from-yellow-400 to-yellow-500' 
                      : 'bg-gray-200 opacity-50'
                  }`}
                  title={achievement.description}
                >
                  <div className={`text-lg mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {ACHIEVEMENT_ICONS[achievement.name as keyof typeof ACHIEVEMENT_ICONS] || '🏆'}
                  </div>
                  <div className={`text-xs font-medium ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Level Progress */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">升级进度</span>
                <span className="text-sm text-gray-600">
                  {expInLevel}/{expForNext - currentLevelExp} XP
                </span>
              </div>
              <Progress value={levelProgress} className="h-2 mb-2" />
              <p className="text-xs text-gray-600 text-center">
                还需 {expForNext - user.exp} 经验值升至等级 {user.level + 1}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-green-700">表现概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">平均评分</div>
              <div className="flex justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i}
                    className={`text-sm ${i < Math.round(stats.averageRating) ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round((stats.completedTasks / Math.max(stats.totalDays, 1)) * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">日均任务</div>
              <div className="text-xs text-gray-500 mt-1">个/天</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(stats.totalTime / Math.max(stats.totalDays, 1))}
              </div>
              <div className="text-sm text-gray-600">日均时长</div>
              <div className="text-xs text-gray-500 mt-1">分钟/天</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {Math.round((stats.diaryCount / Math.max(stats.totalDays, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">日记记录率</div>
              <div className="text-xs text-gray-500 mt-1">写日记的天数占比</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
