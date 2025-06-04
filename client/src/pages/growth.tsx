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

interface Task {
  id: number;
  title: string;
  description: string;
  level: number;
  difficulty: string;
  category: string;
}

interface UserTask {
  id: number;
  userId: number;
  taskId: number;
  rating: number | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  task: Task;
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

  // Fetch user tasks (challenge progress)
  const { data: userTasks = [] } = useQuery<UserTask[]>({
    queryKey: ["/api/user-tasks"],
  });

  // Fetch training sessions
  const { data: trainingSessions = [] } = useQuery<TrainingSession[]>({
    queryKey: ["/api/training-sessions"],
  });

  // Fetch training records
  const { data: trainingRecords = [] } = useQuery<TrainingRecord[]>({
    queryKey: ["/api/training-records"],
  });

  // Calculate statistics
  const completedTasks = userTasks.filter(ut => ut.completed);
  const totalTasks = userTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  const completedTraining = trainingSessions.filter(ts => ts.completed);
  const totalTrainingTime = completedTraining.reduce((sum, session) => sum + (session.duration || 0), 0);
  const avgRating = completedTraining.length > 0 
    ? completedTraining.reduce((sum, session) => sum + (session.rating || 0), 0) / completedTraining.length 
    : 0;

  // Group tasks by category
  const categories = ["all", "直线击球", "角度球", "走位控制", "球感训练", "心理训练"];
  const filteredTasks = selectedCategory === "all" 
    ? userTasks 
    : userTasks.filter(ut => ut.task.category === selectedCategory);

  // Level progression
  const currentLevelExp = (user?.exp || 0) % 1000;
  const nextLevelProgress = (currentLevelExp / 1000) * 100;

  // Achievement calculations
  const getAchievements = () => {
    const achievements = [];
    
    if (completedTasks.length >= 1) achievements.push({ name: "初次尝试", description: "完成第一个练习", earned: true });
    if (completedTasks.length >= 10) achievements.push({ name: "勤奋练习", description: "完成10个练习", earned: true });
    if (completedTasks.length >= 25) achievements.push({ name: "持之以恒", description: "完成25个练习", earned: true });
    if (user?.streak && user.streak >= 7) achievements.push({ name: "一周连击", description: "连续训练7天", earned: true });
    if (user?.streak && user.streak >= 30) achievements.push({ name: "月度坚持", description: "连续训练30天", earned: true });
    if (totalTrainingTime >= 300) achievements.push({ name: "时间投入", description: "总训练时间超过5小时", earned: true });
    
    // Future achievements
    if (completedTasks.length < 50) achievements.push({ name: "半百达成", description: "完成50个练习", earned: false });
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{user?.level || 1}</div>
            <div className="text-sm text-gray-500 mb-2">当前等级</div>
            <Progress value={nextLevelProgress} className="h-2" />
            <div className="text-xs text-gray-400 mt-1">{currentLevelExp}/1000 EXP</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-sm text-gray-500">已完成练习</div>
            <div className="text-xs text-gray-400 mt-1">完成率 {completionRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{user?.streak || 0}</div>
            <div className="text-sm text-gray-500">连续天数</div>
            <div className="text-xs text-gray-400 mt-1">保持训练习惯</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.floor(totalTrainingTime / 60)}h</div>
            <div className="text-sm text-gray-500">总训练时间</div>
            <div className="text-xs text-gray-400 mt-1">{totalTrainingTime % 60}分钟</div>
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
                {[1, 2, 3, 4, 5].map(level => {
                  const levelTasks = filteredTasks.filter(ut => ut.task.level === level);
                  const levelCompleted = levelTasks.filter(ut => ut.completed).length;
                  const levelTotal = levelTasks.length;
                  const levelProgress = levelTotal > 0 ? (levelCompleted / levelTotal) * 100 : 0;
                  
                  return (
                    <div key={level} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">等级 {level}</span>
                        <span className="text-sm text-gray-500">{levelCompleted}/{levelTotal}</span>
                      </div>
                      <Progress value={levelProgress} className="h-3" />
                      
                      {/* Individual tasks for this level */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {levelTasks.map(userTask => (
                          <div
                            key={userTask.id}
                            className={`p-3 rounded-lg border ${
                              userTask.completed 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {userTask.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium">{userTask.task.title}</span>
                              </div>
                              {userTask.completed && userTask.rating && (
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-xs">{userTask.rating}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{userTask.task.category}</div>
                          </div>
                        ))}
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