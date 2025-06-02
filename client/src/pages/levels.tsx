import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
}

interface Exercise {
  id: string;
  level: number;
  exerciseNumber: number;
  title: string;
  description: string;
  imageUrl: string;
  completed: boolean;
  stars: number;
}

export default function Levels() {
  const [selectedLevel, setSelectedLevel] = useState<LevelStage | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  if (userLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-48 h-8 skeleton mx-auto mb-4"></div>
          <div className="w-64 h-6 skeleton mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton h-96 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8">数据加载失败</div>;
  }

  // 基于assessments文件夹的等级关卡配置
  const levelStages: LevelStage[] = [
    {
      level: 1,
      name: "初窥门径",
      totalExercises: 37,
      category: "启明星",
      description: "在启明星教准轨道，让台球成为你的第一颗卫星！台球技术基础框架搭建",
      unlocked: true,
      completed: user.level > 1,
      progress: user.level > 1 ? 100 : Math.min((user.exp / 100) * 100, 95),
      completedExercises: user.level > 1 ? 37 : Math.floor((user.exp / 100) * 37)
    },
    {
      level: 2,
      name: "小有所成",
      totalExercises: 42,
      category: "启明星",
      description: "台球技术基础框架搭建",
      unlocked: user.level >= 2,
      completed: user.level > 2,
      progress: user.level > 2 ? 100 : user.level === 2 ? Math.min((user.exp / 200) * 100, 95) : 0,
      completedExercises: user.level > 2 ? 42 : user.level === 2 ? Math.floor((user.exp / 200) * 42) : 0
    },
    {
      level: 3,
      name: "渐入佳境",
      totalExercises: 52,
      category: "启明星",
      description: "掌握基本走位与控球技巧",
      unlocked: user.level >= 3,
      completed: user.level > 3,
      progress: user.level > 3 ? 100 : user.level === 3 ? Math.min((user.exp / 300) * 100, 95) : 0,
      completedExercises: user.level > 3 ? 52 : user.level === 3 ? Math.floor((user.exp / 300) * 52) : 0
    },
    {
      level: 4,
      name: "炉火纯青",
      totalExercises: 62,
      category: "超新星",
      description: "引爆超新星的潜能，用球杆雕刻台面法则！力度与杆法的完美艺术",
      unlocked: user.level >= 4,
      completed: user.level > 4,
      progress: user.level > 4 ? 100 : user.level === 4 ? Math.min((user.exp / 400) * 100, 95) : 0,
      completedExercises: user.level > 4 ? 62 : user.level === 4 ? Math.floor((user.exp / 400) * 62) : 0
    },
    {
      level: 5,
      name: "登堂入室",
      totalExercises: 62,
      category: "超新星",
      description: "高阶控球与实战训练",
      unlocked: user.level >= 5,
      completed: user.level > 5,
      progress: user.level > 5 ? 100 : user.level === 5 ? Math.min((user.exp / 500) * 100, 95) : 0,
      completedExercises: user.level > 5 ? 62 : user.level === 5 ? Math.floor((user.exp / 500) * 62) : 0
    },
    {
      level: 6,
      name: "超群绝伦",
      totalExercises: 62,
      category: "超新星",
      description: "精确走位与复杂球局",
      unlocked: user.level >= 6,
      completed: user.level > 6,
      progress: user.level > 6 ? 100 : user.level === 6 ? Math.min((user.exp / 600) * 100, 95) : 0,
      completedExercises: user.level > 6 ? 62 : user.level === 6 ? Math.floor((user.exp / 600) * 62) : 0
    },
    {
      level: 7,
      name: "登峰造极",
      totalExercises: 72,
      category: "智子星",
      description: "在智子星的宏观维度，用一杆终结所有因果链！台球桌上的战略思维",
      unlocked: user.level >= 7,
      completed: user.level > 7,
      progress: user.level > 7 ? 100 : user.level === 7 ? Math.min((user.exp / 700) * 100, 95) : 0,
      completedExercises: user.level > 7 ? 72 : user.level === 7 ? Math.floor((user.exp / 700) * 72) : 0
    },
    {
      level: 8,
      name: "出神入化",
      totalExercises: 72,
      category: "智子星",
      description: "超越技巧的艺术境界",
      unlocked: user.level >= 8,
      completed: user.level > 8,
      progress: user.level > 8 ? 100 : user.level === 8 ? Math.min((user.exp / 800) * 100, 95) : 0,
      completedExercises: user.level > 8 ? 72 : user.level === 8 ? Math.floor((user.exp / 800) * 72) : 0
    },
    {
      level: 9,
      name: "人杆合一",
      totalExercises: 72,
      category: "智子星",
      description: "台球的最高境界",
      unlocked: user.level >= 9,
      completed: false,
      progress: user.level === 9 ? Math.min((user.exp / 900) * 100, 100) : 0,
      completedExercises: user.level === 9 ? Math.floor((user.exp / 900) * 72) : 0
    }
  ];

  const getCategoryColor = (category: string) => {
    switch(category) {
      case "启明星": return "from-blue-500 to-blue-600";
      case "超新星": return "from-purple-500 to-purple-600";
      case "智子星": return "from-orange-500 to-orange-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "启明星": return "⭐";
      case "超新星": return "💫";
      case "智子星": return "🌟";
      default: return "🏆";
    }
  };

  const generateExercisesForLevel = (level: number): Exercise[] => {
    const stage = levelStages.find(s => s.level === level);
    if (!stage) return [];

    const exercises: Exercise[] = [];
    const levelName = stage.name;
    
    for (let i = 0; i < stage.totalExercises; i++) {
      const exerciseNumber = i.toString().padStart(2, '0');
      exercises.push({
        id: `${level}-${exerciseNumber}`,
        level,
        exerciseNumber: i,
        title: `第${i + 1}题`,
        description: `${levelName}阶段练习第${i + 1}题，按照图示要求完成练习。`,
        imageUrl: `/assessments/${level}、${levelName}/${level}、${levelName}_${exerciseNumber}.jpg`,
        completed: i < stage.completedExercises,
        stars: i < stage.completedExercises ? Math.floor(Math.random() * 3) + 1 : 0
      });
    }
    
    return exercises;
  };

  const handleLevelClick = (stage: LevelStage) => {
    if (!stage.unlocked) {
      toast({
        title: "等级未解锁",
        description: "请先完成前面的等级才能解锁此关卡。",
        variant: "destructive",
      });
      return;
    }
    setSelectedLevel(stage);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDialog(true);
  };

  const canTakeExam = (stage: LevelStage) => {
    return stage.level > 1 && stage.completedExercises >= stage.totalExercises;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-700 mb-2">关卡地图</h2>
        <p className="text-gray-600">选择等级开始挑战，完成所有习题解锁下一级</p>
        <div className="inline-flex items-center bg-green-100 rounded-full px-4 py-2 mt-4">
          <span className="mr-2">🏆</span>
          <span className="text-green-700 font-medium">当前等级: {user.level} - {levelStages.find(s => s.level === user.level)?.name}</span>
        </div>
      </div>

      {/* Level Grid */}
      {!selectedLevel ? (
        <div className="grid md:grid-cols-3 gap-6">
          {levelStages.map((stage) => (
            <Card 
              key={stage.level} 
              className={`cursor-pointer transition-all duration-300 hover:scale-105 overflow-hidden ${
                !stage.unlocked ? 'opacity-60 cursor-not-allowed' : ''
              } ${stage.level === user.level ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => handleLevelClick(stage)}
            >
              <CardHeader className={`bg-gradient-to-r ${getCategoryColor(stage.category)} text-white pb-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(stage.category)}</span>
                    <CardTitle className="text-lg">等级 {stage.level}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {stage.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <h3 className="font-bold text-gray-800 mb-2">{stage.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{stage.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">进度</span>
                    <span className="font-medium">{stage.completedExercises}/{stage.totalExercises}</span>
                  </div>
                  <Progress value={stage.progress} className="h-2" />
                  
                  {stage.completed && (
                    <div className="flex items-center text-green-600 text-sm">
                      <span className="mr-1">✅</span>
                      <span>已完成</span>
                    </div>
                  )}
                  
                  {!stage.unlocked && (
                    <div className="flex items-center text-gray-400 text-sm">
                      <span className="mr-1">🔒</span>
                      <span>未解锁</span>
                    </div>
                  )}
                  
                  {canTakeExam(stage) && (
                    <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                      参加等级考核
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Exercise Grid */
        <div>
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedLevel(null)}
              className="flex items-center space-x-2"
            >
              <span>←</span>
              <span>返回关卡地图</span>
            </Button>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-700">{selectedLevel.name}</h3>
              <p className="text-gray-600">等级 {selectedLevel.level} - {selectedLevel.category}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">进度</div>
              <div className="font-bold">{selectedLevel.completedExercises}/{selectedLevel.totalExercises}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-6 gap-4">
            {generateExercisesForLevel(selectedLevel.level).map((exercise) => (
              <Card 
                key={exercise.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  exercise.completed ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleExerciseClick(exercise)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">
                    {exercise.completed ? '✅' : '⭕'}
                  </div>
                  <div className="text-sm font-medium mb-1">{exercise.title}</div>
                  {exercise.completed && (
                    <div className="text-xs text-yellow-600">
                      {'⭐'.repeat(exercise.stars)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {canTakeExam(selectedLevel) && (
            <Card className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6 text-center">
                <h4 className="text-xl font-bold text-orange-700 mb-2">🏆 等级考核解锁</h4>
                <p className="text-gray-700 mb-4">
                  恭喜完成所有习题！现在可以参加等级 {selectedLevel.level} 的考核。
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  考核规则：{selectedLevel.category === "启明星" ? "随机抽取6题，限时2小时" : 
                           selectedLevel.category === "超新星" ? "随机抽取8题，限时2小时" : 
                           "随机抽取10题，限时3小时"}
                </p>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  开始等级考核
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Exercise Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="max-w-2xl">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedExercise.title} - {selectedLevel?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <img 
                  src={selectedExercise.imageUrl} 
                  alt={selectedExercise.title}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
                  }}
                />
                <p className="text-gray-700">{selectedExercise.description}</p>
                {selectedExercise.completed ? (
                  <div className="text-center">
                    <div className="text-green-600 mb-2">✅ 已完成</div>
                    <div className="text-yellow-600">{'⭐'.repeat(selectedExercise.stars)}</div>
                  </div>
                ) : (
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    开始练习
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}