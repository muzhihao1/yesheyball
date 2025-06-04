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
  const totalTrainingTime = completedTraining.reduce((sum, session) => sum + (session.duration || 0), 0);
  const avgRating = completedTraining.length > 0 
    ? completedTraining.reduce((sum, session) => sum + (session.rating || 0), 0) / completedTraining.length 
    : 0;

  // Group levels by category
  const categories = ["all", "启明星", "超新星", "智子星"];
  const filteredLevels = selectedCategory === "all" 
    ? levelStages 
    : levelStages.filter(stage => stage.category === selectedCategory);

  // Level progression
  const currentLevelExp = (user?.exp || 0) % 1000;
  const nextLevelProgress = (currentLevelExp / 1000) * 100;

  // Achievement calculations
  const getAchievements = () => {
    const achievements = [];
    
    if (totalCompletedExercises >= 1) achievements.push({ name: "初次尝试", description: "完成第一个练习", earned: true });
    if (totalCompletedExercises >= 10) achievements.push({ name: "勤奋练习", description: "完成10个练习", earned: true });
    if (totalCompletedExercises >= 25) achievements.push({ name: "持之以恒", description: "完成25个练习", earned: true });
    if (user?.streak && user.streak >= 7) achievements.push({ name: "一周连击", description: "连续训练7天", earned: true });
    if (user?.streak && user.streak >= 30) achievements.push({ name: "月度坚持", description: "连续训练30天", earned: true });
    if (totalTrainingTime >= 300) achievements.push({ name: "时间投入", description: "总训练时间超过5小时", earned: true });
    
    // Future achievements
    if (totalCompletedExercises < 50) achievements.push({ name: "半百达成", description: "完成50个练习", earned: false });
    if (!user?.streak || user.streak < 100) achievements.push({ name: "百日坚持", description: "连续训练100天", earned: false });
    
    return achievements;
  };

  const achievements = getAchievements();
  const earnedAchievements = achievements.filter(a => a.earned);

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
                    <div className="text-xl font-bold text-green-600">{Math.floor(totalTrainingTime / 60)}h {totalTrainingTime % 60}m</div>
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
                  {earnedAchievements.length}/{achievements.length} 已获得
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      achievement.earned
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {achievement.earned ? (
                          <Award className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <Lock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          achievement.earned ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {achievement.name}
                        </h3>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <Badge className="bg-yellow-100 text-yellow-800">已获得</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}