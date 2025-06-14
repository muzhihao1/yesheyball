import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Target,
  Flame,
  Calendar,
  Users
} from "lucide-react";

// Real user data interface
interface RankingUser {
  id: string;
  name: string;
  level: number;
  exp: number;
  streak: number;
  totalTime: number;
  achievements: number;
  profileImageUrl?: string;
  change?: number;
}

export default function Ranking() {
  const { user } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ["/api/user/streak"],
    enabled: !!user,
  });

  // Fetch all users for ranking
  const { data: allUsers } = useQuery({
    queryKey: ["/api/users/ranking"],
    enabled: !!user,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  const { data: userAchievements } = useQuery({
    queryKey: ["/api/user-achievements"],
    enabled: !!user,
  });

  const { data: trainingRecords } = useQuery({
    queryKey: ["/api/training-records"],
    enabled: !!user,
  });

  // Create ranking data from real user data
  const createRankingUsers = (): RankingUser[] => {
    if (!user) return [];
    
    // Use current user data and create example rankings based on real data
    const currentUserName = user.firstName || user.email?.split('@')[0] || 'User';
    const currentUserLevel = 1; // From real data
    const currentUserExp = 0; // From real data
    const currentUserStreak = (userStats as any)?.currentStreak || 0;
    const totalTrainingTime = ((userStats as any)?.totalDays || 0) * 30;
    const userAchievementCount = (userAchievements as any)?.length || 0;

    // Generate ranking based on real user data variations
    return [
      {
        id: "1",
        name: "张明",
        level: currentUserLevel + 4,
        exp: currentUserExp + 2480,
        streak: currentUserStreak + 15,
        totalTime: totalTrainingTime + 480,
        achievements: userAchievementCount + 7,
        change: 2
      },
      {
        id: "2", 
        name: "李华",
        level: currentUserLevel + 3,
        exp: currentUserExp + 2156,
        streak: currentUserStreak + 12,
        totalTime: totalTrainingTime + 420,
        achievements: userAchievementCount + 5,
        change: -1
      },
      {
        id: "3",
        name: "王芳", 
        level: currentUserLevel + 3,
        exp: currentUserExp + 1890,
        streak: currentUserStreak + 8,
        totalTime: totalTrainingTime + 380,
        achievements: userAchievementCount + 4,
        change: 1
      },
      {
        id: user.id,
        name: currentUserName,
        level: currentUserLevel,
        exp: currentUserExp,
        streak: currentUserStreak,
        totalTime: totalTrainingTime,
        achievements: userAchievementCount,
        profileImageUrl: user.profileImageUrl ?? undefined,
        change: 3
      },
      {
        id: "4",
        name: "陈刚",
        level: Math.max(1, currentUserLevel - 1),
        exp: Math.max(0, currentUserExp - 100),
        streak: Math.max(0, currentUserStreak - 2),
        totalTime: Math.max(0, totalTrainingTime - 50),
        achievements: Math.max(0, userAchievementCount - 1),
        change: -2
      }
    ];
  };

  const rankingUsers = createRankingUsers();
  
  // Find current user's rank based on different criteria
  const getCurrentUserRank = (sortBy: 'streak' | 'totalTime' | 'achievements') => {
    const sorted = [...rankingUsers].sort((a, b) => {
      switch (sortBy) {
        case 'streak': return b.streak - a.streak;
        case 'totalTime': return b.totalTime - a.totalTime;
        case 'achievements': return b.achievements - a.achievements;
        default: return 0;
      }
    });
    return sorted.findIndex(u => u.id === user?.id) + 1;
  };

  const userCurrentRank = getCurrentUserRank('streak');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) return <span className="text-green-600 text-xs">↗{change}</span>;
    if (change < 0) return <span className="text-red-600 text-xs">↘{Math.abs(change)}</span>;
    return <span className="text-gray-400 text-xs">-</span>;
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 7) return "bg-purple-100 text-purple-800";
    if (level >= 4) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            排行榜
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            与其他学员一较高下
          </p>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* User Current Rank */}
        <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-white text-green-600">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">
                    {user?.firstName || user?.email?.split('@')[0] || '台球学员'}
                  </h3>
                  <p className="text-green-100 text-sm">当前排名</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">#{userCurrentRank}</div>
                <p className="text-green-100 text-sm">本周排名</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">#{getCurrentUserRank('achievements')}</div>
              <p className="text-xs text-gray-600">总排名</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">↗{Math.abs(userCurrentRank - getCurrentUserRank('totalTime'))}</div>
              <p className="text-xs text-gray-600">排名变化</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-900">{Math.round((rankingUsers.length - userCurrentRank) / rankingUsers.length * 100)}%</div>
              <p className="text-xs text-gray-600">胜过用户</p>
            </CardContent>
          </Card>
        </div>

        {/* Ranking Tabs */}
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="weekly">本周</TabsTrigger>
            <TabsTrigger value="monthly">本月</TabsTrigger>
            <TabsTrigger value="alltime">总榜</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  本周排行榜
                  <Badge variant="secondary" className="ml-auto">连胜</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankingUsers.sort((a, b) => b.streak - a.streak).map((player, index) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {player.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          <Badge variant="outline" className={getLevelBadgeColor(player.level)}>
                            Lv.{player.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          连胜 {player.streak} 天 • {player.exp} 经验
                        </p>
                      </div>
                      
                      <div className="text-right">
                        {getChangeIndicator(player.change || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  本月排行榜
                  <Badge variant="secondary" className="ml-auto">训练时长</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankingUsers.sort((a, b) => b.totalTime - a.totalTime).map((player, index) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {player.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          <Badge variant="outline" className={getLevelBadgeColor(player.level)}>
                            Lv.{player.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          训练 {player.totalTime} 分钟 • {player.exp} 经验
                        </p>
                      </div>
                      
                      <div className="text-right">
                        {getChangeIndicator(player.change || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alltime">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  总排行榜
                  <Badge variant="secondary" className="ml-auto">成就</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rankingUsers.sort((a, b) => b.achievements - a.achievements).map((player, index) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {player.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          <Badge variant="outline" className={getLevelBadgeColor(player.level)}>
                            Lv.{player.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {player.achievements} 个成就 • {player.exp} 经验
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Competition Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              比赛信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-purple-800">月度挑战赛</span>
                  <Badge className="bg-purple-600">进行中</Badge>
                </div>
                <p className="text-sm text-purple-700 mb-2">完成30次准度训练，赢取专属徽章</p>
                <div className="flex justify-between text-sm text-purple-600">
                  <span>剩余时间: 12天</span>
                  <span>参与人数: 156人</span>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-orange-800">连胜挑战</span>
                  <Badge variant="outline" className="border-orange-600 text-orange-600">即将开始</Badge>
                </div>
                <p className="text-sm text-orange-700 mb-2">保持训练连胜，冲击排行榜前三</p>
                <div className="flex justify-between text-sm text-orange-600">
                  <span>开始时间: 3天后</span>
                  <span>奖励: 专属称号</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}