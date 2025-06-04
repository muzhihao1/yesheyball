import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Clock, 
  Star, 
  TrendingUp, 
  Calendar, 
  Award,
  BookOpen,
  CheckCircle,
  Circle,
  Lock
} from "lucide-react";

interface User {
  id: number;
  username: string;
  level: number;
  exp: number;
  streak: number;
  totalDays: number;
  completedTasks: number;
  totalTime: number;
}

interface LevelStage {
  level: number;
  name: string;
  totalExercises: number;
  category: "启明星" | "超新星" | "智子星";
  description: string;
  unlocked: boolean;
  completed: boolean;
  progress: number;
  completedExercises: number;
  examPassed?: boolean;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: string;
  condition: any;
  expReward: number;
  category: "beginner" | "intermediate" | "advanced" | "master";
  unlocked: boolean;
  createdAt: string;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  progress: number;
  completed: boolean;
  unlockedAt: string;
  achievement: Achievement;
}

interface TrainingSession {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  duration: number | null;
  rating: number | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  sessionType: string;
}

interface TrainingRecord {
  id: number;
  userId: number;
  title: string;
  content: string;
  duration: number | null;
  rating: number | null;
  completedAt: Date;
}

export default function GrowthPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Fetch training sessions
  const { data: trainingSessions = [] } = useQuery<TrainingSession[]>({
    queryKey: ["/api/training-sessions"],
  });

  // Fetch training records
  const { data: trainingRecords = [] } = useQuery<TrainingRecord[]>({
    queryKey: ["/api/training-records"],
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  // Fetch user achievements
  const { data: userAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ["/api/user-achievements"],
  });

  if (!user) {
    return <div>加载中...</div>;
  }

  // Generate level stages based on user progress (same logic as levels page)
  const levelStages: LevelStage[] = [
    {
      level: 1,
      name: "初窥门径",
      totalExercises: 30,
      category: "启明星",
      description: "掌握基础击球姿势与瞄准技巧",
      unlocked: user.level >= 1,
      completed: user.level > 1,
      progress: user.level > 1 ? 100 : Math.min((user.exp / 100) * 100, 95),
      completedExercises: user.level > 1 ? 30 : Math.floor((user.exp / 100) * 30)
    },
    {
      level: 2,
      name: "小有所成",
      totalExercises: 40,
      category: "启明星",
      description: "练习各种角度的击球技巧",
      unlocked: user.level >= 2,
      completed: user.level > 2,
      progress: user.level > 2 ? 100 : user.level === 2 ? Math.min((user.exp / 200) * 100, 95) : 0,
      completedExercises: user.level > 2 ? 40 : user.level === 2 ? Math.floor((user.exp / 200) * 40) : 0
    },
    {
      level: 3,
      name: "渐入佳境",
      totalExercises: 50,
      category: "启明星",
      description: "掌握基本走位与控球技巧",
      unlocked: user.level >= 3,
      completed: user.level > 3,
      progress: user.level > 3 ? 100 : user.level === 3 ? Math.min((user.exp / 300) * 100, 95) : 0,
      completedExercises: user.level > 3 ? 50 : user.level === 3 ? Math.floor((user.exp / 300) * 50) : 0
    },
    {
      level: 4,
      name: "炉火纯青",
      totalExercises: 60,
      category: "超新星",
      description: "在超新星的引力场中，精准控制每一次撞击",
      unlocked: user.level >= 4,
      completed: user.level > 4,
      progress: user.level > 4 ? 100 : user.level === 4 ? Math.min((user.exp / 400) * 100, 95) : 0,
      completedExercises: user.level > 4 ? 60 : user.level === 4 ? Math.floor((user.exp / 400) * 60) : 0
    },
    {
      level: 5,
      name: "登堂入室",
      totalExercises: 60,
      category: "超新星",
      description: "技术日臻成熟，走位精准",
      unlocked: user.level >= 5,
      completed: user.level > 5,
      progress: user.level > 5 ? 100 : user.level === 5 ? Math.min((user.exp / 500) * 100, 95) : 0,
      completedExercises: user.level > 5 ? 60 : user.level === 5 ? Math.floor((user.exp / 500) * 60) : 0
    },
    {
      level: 6,
      name: "超群绝伦",
      totalExercises: 60,
      category: "超新星",
      description: "精确走位与复杂球局",
      unlocked: user.level >= 6,
      completed: user.level > 6,
      progress: user.level > 6 ? 100 : user.level === 6 ? Math.min((user.exp / 600) * 100, 95) : 0,
      completedExercises: user.level > 6 ? 60 : user.level === 6 ? Math.floor((user.exp / 600) * 60) : 0
    },
    {
      level: 7,
      name: "登峰造极",
      totalExercises: 55,
      category: "智子星",
      description: "在智子星的宏观维度，用一杆终结所有因果链",
      unlocked: user.level >= 7,
      completed: user.level > 7,
      progress: user.level > 7 ? 100 : user.level === 7 ? Math.min((user.exp / 700) * 100, 95) : 0,
      completedExercises: user.level > 7 ? 55 : user.level === 7 ? Math.floor((user.exp / 700) * 55) : 0
    },
    {
      level: 8,
      name: "出神入化",
      totalExercises: 55,
      category: "智子星",
      description: "超越技巧的艺术境界",
      unlocked: user.level >= 8,
      completed: user.level > 8,
      progress: user.level > 8 ? 100 : user.level === 8 ? Math.min((user.exp / 800) * 100, 95) : 0,
      completedExercises: user.level > 8 ? 55 : user.level === 8 ? Math.floor((user.exp / 800) * 55) : 0
    }
  ];

  // Calculate statistics from level stages
  const completedLevels = levelStages.filter(stage => stage.completed);
  const totalCompletedExercises = levelStages.reduce((sum, stage) => sum + stage.completedExercises, 0);
  const totalExercises = levelStages.reduce((sum, stage) => sum + stage.totalExercises, 0);
  const completionRate = totalExercises > 0 ? Math.round((totalCompletedExercises / totalExercises) * 100) : 0;
  
  const completedTraining = trainingSessions.filter(ts => ts.completed);
  
  // Fix total training time calculation (convert seconds to proper format)
  const totalTrainingTimeSeconds = completedTraining.reduce((sum, session) => sum + (session.duration || 0), 0);
  const totalTrainingTime = totalTrainingTimeSeconds; // Keep in seconds for calculations
  
  // Fix average rating calculation (exclude sessions without ratings)
  const ratedSessions = completedTraining.filter(session => session.rating && session.rating > 0);
  const avgRating = ratedSessions.length > 0 
    ? ratedSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / ratedSessions.length 
    : 0;

  // Group levels by category
  const categories = ["all", "启明星", "超新星", "智子星"];
  const filteredLevels = selectedCategory === "all" 
    ? levelStages 
    : levelStages.filter(stage => stage.category === selectedCategory);

  // Level progression
  const currentLevelExp = (user?.exp || 0) % 1000;
  const nextLevelProgress = (currentLevelExp / 1000) * 100;

  // Combine achievements data with user progress
  const combinedAchievements = achievements.map(achievement => {
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
    return {
      ...achievement,
      userProgress: userAchievement?.progress || 0,
      completed: userAchievement?.completed || false,
      unlockedAt: userAchievement?.unlockedAt
    };
  });

  // Group achievements by category
  const achievementCategories = {
    beginner: combinedAchievements.filter(a => a.category === "beginner"),
    intermediate: combinedAchievements.filter(a => a.category === "intermediate"),
    advanced: combinedAchievements.filter(a => a.category === "advanced"),
    master: combinedAchievements.filter(a => a.category === "master")
  };

  const getProgressPercentage = (achievement: any) => {
    const condition = achievement.condition;
    if (!condition?.target) return 0;
    return Math.min((achievement.userProgress / condition.target) * 100, 100);
  };

  const earnedAchievements = combinedAchievements.filter(a => a.completed);
  const totalAchievements = combinedAchievements.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-700">成长路径</h1>
        <p className="text-gray-600">追踪你的台球学习进展</p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{completedLevels.length}</div>
            <div className="text-sm text-gray-500">已通关数</div>
            <div className="text-xs text-gray-400 mt-1">共8个等级</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalCompletedExercises}</div>
            <div className="text-sm text-gray-500">完成练习</div>
            <div className="text-xs text-gray-400 mt-1">练习进度 {completionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{completedTraining.length}</div>
            <div className="text-sm text-gray-500">训练次数</div>
            <div className="text-xs text-gray-400 mt-1">{avgRating > 0 ? `平均${avgRating.toFixed(1)}星` : '暂无评分'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{earnedAchievements.length}</div>
            <div className="text-sm text-gray-500">获得成就</div>
            <div className="text-xs text-gray-400 mt-1">共{achievements.length}个成就</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="challenges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges">闯关记录</TabsTrigger>
          <TabsTrigger value="training">训练记录</TabsTrigger>
          <TabsTrigger value="achievements">成就系统</TabsTrigger>
        </TabsList>

        {/* Challenge Progress */}
        <TabsContent value="challenges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                技能挑战进度
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === "all" ? "全部" : category}
                  </Badge>
                ))}
              </div>

              {/* Progress by Level */}
              <div className="space-y-4">
                {filteredLevels.map(stage => {
                  const levelProgress = stage.progress;
                  
                  return (
                    <div key={stage.level} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">等级 {stage.level} - {stage.name}</span>
                        <span className="text-sm text-gray-500">{stage.completedExercises}/{stage.totalExercises}</span>
                      </div>
                      <Progress value={levelProgress} className="h-3" />
                      
                      {/* Level details */}
                      <div className={`p-3 rounded-lg border ${
                        stage.completed 
                          ? 'bg-green-50 border-green-200' 
                          : stage.unlocked
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {stage.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : stage.unlocked ? (
                              <Circle className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium">{stage.category}</span>
                          </div>
                          <Badge variant={stage.completed ? "default" : stage.unlocked ? "secondary" : "outline"}>
                            {stage.completed ? "已完成" : stage.unlocked ? "进行中" : "未解锁"}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{stage.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Records */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                训练历程
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Training Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{completedTraining.length}</div>
                    <div className="text-sm text-gray-600">完成训练</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {Math.floor(totalTrainingTimeSeconds / 3600)}h {Math.floor((totalTrainingTimeSeconds % 3600) / 60)}m
                    </div>
                    <div className="text-sm text-gray-600">总时长</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">{avgRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">平均评分</div>
                  </div>
                </div>

                {/* Recent Training Records */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">最近训练记录</h3>
                  {trainingRecords.slice(0, 10).map((record) => (
                    <div key={record.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-white rounded-r-lg shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{record.title}</h4>
                          <p className="text-gray-600 mt-1 text-sm">{record.content}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(record.completedAt).toLocaleDateString('zh-CN')}
                            {record.duration && (
                              <div className="ml-4 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {Math.floor(record.duration / 60)}分钟
                              </div>
                            )}
                            {record.rating && (
                              <div className="ml-4 flex items-center">
                                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                {record.rating}/5
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                成就系统
                <span className="ml-auto text-sm font-normal text-gray-500">
                  {earnedAchievements.length}/{totalAchievements} 已获得
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Achievement Categories */}
                {Object.entries(achievementCategories).map(([category, categoryAchievements]) => {
                  const categoryNames = {
                    beginner: "新手成就",
                    intermediate: "进阶成就", 
                    advanced: "高级成就",
                    master: "大师成就"
                  };
                  
                  return (
                    <div key={category} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className="text-2xl mr-2">
                          {category === "beginner" && "🌟"}
                          {category === "intermediate" && "⚡"}
                          {category === "advanced" && "🏆"}
                          {category === "master" && "👑"}
                        </span>
                        {categoryNames[category as keyof typeof categoryNames]}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryAchievements.map((achievement) => {
                          const progressPercentage = getProgressPercentage(achievement);
                          const isLocked = !achievement.unlocked && !achievement.completed;
                          
                          return (
                            <div
                              key={achievement.id}
                              className={`p-4 rounded-lg border transition-all duration-200 ${
                                achievement.completed
                                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm'
                                  : isLocked
                                  ? 'bg-gray-50 border-gray-200 opacity-60'
                                  : 'bg-blue-50 border-blue-200'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-full text-2xl ${
                                  achievement.completed 
                                    ? 'bg-yellow-100' 
                                    : isLocked
                                    ? 'bg-gray-100 grayscale'
                                    : 'bg-blue-100'
                                }`}>
                                  {achievement.completed ? (
                                    <span>✨</span>
                                  ) : isLocked ? (
                                    <Lock className="h-5 w-5 text-gray-400" />
                                  ) : (
                                    <span>{achievement.icon}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-medium truncate ${
                                      achievement.completed 
                                        ? 'text-gray-900' 
                                        : isLocked
                                        ? 'text-gray-500'
                                        : 'text-gray-800'
                                    }`}>
                                      {achievement.name}
                                    </h4>
                                    {achievement.completed && (
                                      <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                                        +{achievement.expReward}XP
                                      </Badge>
                                    )}
                                  </div>
                                  <p className={`text-sm mb-2 ${
                                    achievement.completed 
                                      ? 'text-gray-600' 
                                      : isLocked
                                      ? 'text-gray-400'
                                      : 'text-gray-600'
                                  }`}>
                                    {achievement.description}
                                  </p>
                                  
                                  {/* Progress Bar */}
                                  {!achievement.completed && achievement.condition?.target && (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs text-gray-500">
                                        <span>进度: {achievement.userProgress} / {achievement.condition.target}</span>
                                        <span>{Math.round(progressPercentage)}%</span>
                                      </div>
                                      <Progress 
                                        value={progressPercentage} 
                                        className="h-2"
                                      />
                                    </div>
                                  )}
                                  
                                  {achievement.completed && achievement.unlockedAt && (
                                    <p className="text-xs text-yellow-600 mt-2">
                                      获得时间: {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}