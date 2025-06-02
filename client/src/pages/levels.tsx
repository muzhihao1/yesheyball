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
    
    // 跳过前两张图片（00和01），从02开始作为第一题
    const actualExerciseCount = stage.totalExercises - 2;
    
    for (let i = 0; i < actualExerciseCount; i++) {
      const exerciseNumber = (i + 2).toString().padStart(2, '0'); // 从02开始
      exercises.push({
        id: `${level}-${exerciseNumber}`,
        level,
        exerciseNumber: i + 1, // 题目编号从1开始
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

  const handleCompleteExercise = async (exercise: Exercise) => {
    try {
      // 模拟练习完成，给予随机星级评价
      const stars = Math.floor(Math.random() * 3) + 1;
      const practiceTime = Math.floor(Math.random() * 30) + 15; // 15-45分钟
      
      // 创建练习日记记录
      const diaryContent = `完成了${exercise.title}练习，获得${stars}星评价。${
        stars === 3 ? '表现优秀！掌握了关键技术要点。' : 
        stars === 2 ? '进步明显，继续努力完善技巧！' : 
        '基础掌握，需要更多练习来提高稳定性。'
      }`;
      
      await apiRequest("/api/diary", {
        method: "POST",
        body: {
          content: diaryContent,
          rating: stars,
          duration: practiceTime,
        }
      });
      
      // 更新本地练习状态
      if (selectedExercise) {
        selectedExercise.completed = true;
        selectedExercise.stars = stars;
      }
      
      toast({
        title: "练习完成！",
        description: `恭喜完成 ${exercise.title}，获得 ${stars} 星评价！练习记录已保存到日记。`,
      });
      
      // 刷新用户数据
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/diary"] });
      
    } catch (error) {
      console.error("完成练习时出错:", error);
      toast({
        title: "完成练习失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
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

      {/* 多邻国风格的垂直滚动关卡地图 */}
      <div className="max-w-md mx-auto bg-gradient-to-b from-green-50 to-blue-50 rounded-xl p-6">
        {/* 用户进度显示 */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-800">{user.username}</div>
              <div className="text-sm text-gray-600">等级 {user.level} - {levelStages.find(s => s.level === user.level)?.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-500">{user.exp}</div>
            <div className="text-xs text-gray-500">经验值</div>
          </div>
        </div>

        {/* 垂直滚动的关卡路径 */}
        <div className="space-y-8">
          {levelStages.map((stage, stageIndex) => (
            <div key={stage.level} className="relative">
              {/* 等级标题卡片 */}
              <div className={`bg-gradient-to-r ${getCategoryColor(stage.category)} rounded-lg p-4 mb-6 text-white shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(stage.category)}</span>
                    <div>
                      <div className="font-bold">等级 {stage.level}: {stage.name}</div>
                      <div className="text-xs opacity-90">{stage.category}阶段</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-90">进度</div>
                    <div className="font-bold">{stage.completedExercises}/{stage.totalExercises - 2}</div>
                  </div>
                </div>
                <Progress value={stage.progress} className="mt-2 h-1 bg-white/20" />
              </div>

              {/* 习题关卡点 - 垂直Z字形排列 */}
              <div className="space-y-4 pl-4">
                {generateExercisesForLevel(stage.level).map((exercise, exerciseIndex) => {
                  const isLeft = exerciseIndex % 2 === 0;
                  const isUnlocked = stage.unlocked && (exercise.completed || exerciseIndex === 0 || generateExercisesForLevel(stage.level)[exerciseIndex - 1]?.completed);
                  
                  return (
                    <div 
                      key={exercise.id} 
                      className={`flex ${isLeft ? 'justify-start' : 'justify-end'} relative`}
                    >
                      {/* 连接线 */}
                      {exerciseIndex > 0 && (
                        <div className={`absolute top-0 w-8 h-4 border-gray-300 ${
                          isLeft ? 'right-12 border-r-2 border-b-2' : 'left-12 border-l-2 border-b-2'
                        } transform -translate-y-4`} />
                      )}
                      
                      {/* 关卡圆圈 */}
                      <div 
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                          !isUnlocked 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : exercise.completed 
                              ? 'bg-green-500 text-white shadow-lg transform scale-105' 
                              : 'bg-white border-4 border-green-500 text-green-500 hover:scale-110 shadow-md'
                        }`}
                        onClick={() => isUnlocked && handleExerciseClick(exercise)}
                      >
                        {!isUnlocked ? (
                          <span className="text-xl">🔒</span>
                        ) : exercise.completed ? (
                          <span className="text-xl">⭐</span>
                        ) : (
                          <span className="text-lg font-bold">{exercise.exerciseNumber}</span>
                        )}
                        
                        {/* 星星评分 */}
                        {exercise.completed && exercise.stars > 0 && (
                          <div className="absolute -top-2 -right-2 text-xs">
                            {'⭐'.repeat(Math.min(exercise.stars, 3))}
                          </div>
                        )}
                      </div>
                      
                      {/* 题目标签 */}
                      <div className={`absolute ${isLeft ? 'left-20' : 'right-20'} top-2 bg-white rounded-lg px-3 py-1 shadow-sm ${
                        !isUnlocked ? 'opacity-50' : ''
                      }`}>
                        <div className="text-sm font-medium text-gray-800">{exercise.title}</div>
                        {exercise.completed && (
                          <div className="text-xs text-green-600">已完成</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 等级考核关卡 */}
              {canTakeExam(stage) && (
                <div className="flex justify-center mt-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center cursor-pointer shadow-xl transform hover:scale-110 transition-all duration-300">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                      等级考核
                    </div>
                  </div>
                </div>
              )}

              {/* 连接下一等级的线 */}
              {stageIndex < levelStages.length - 1 && (
                <div className="flex justify-center mt-8">
                  <div className="w-0.5 h-12 bg-gray-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Dialog */}
      <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {selectedExercise.exerciseNumber}
                    </div>
                    <span className="text-xl">{selectedExercise.title}</span>
                    {selectedExercise.completed && (
                      <Badge className="bg-green-500 text-white">已完成</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    等级 {selectedExercise.level} - {selectedLevel?.name}
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 练习图片和说明 */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 左侧：题目说明 */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <h3 className="font-bold text-blue-700 mb-2">题目说明：</h3>
                      <p className="text-gray-700">如图示摆放球型，将白球击入指定袋内</p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                      <h3 className="font-bold text-orange-700 mb-2">过关要求：</h3>
                      <p className="text-gray-700">连续完成5次不失误</p>
                    </div>
                    
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                      <h3 className="font-bold text-green-700 mb-2">技术要点：</h3>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• 控制击球力度，确保白球准确入袋</li>
                        <li>• 注意瞄准角度和击球点位</li>
                        <li>• 保持稳定的出杆动作</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* 右侧：练习图片 */}
                  <div className="space-y-4">
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                      <img 
                        src={selectedExercise.imageUrl} 
                        alt={selectedExercise.title}
                        className="w-full h-auto"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
                        }}
                      />
                    </div>
                    
                    <div className="text-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {selectedLevel?.name}阶段练习第{selectedExercise.exerciseNumber}题，按照图示要求完成练习。
                    </div>
                  </div>
                </div>
                
                {/* 练习状态和操作 */}
                <div className="border-t pt-6">
                  {selectedExercise.completed ? (
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-6 py-3 rounded-full">
                        <span className="text-xl">✅</span>
                        <span className="font-medium">已完成此练习</span>
                      </div>
                      <div className="text-yellow-600 text-lg">
                        获得 {'⭐'.repeat(selectedExercise.stars)} 星评价
                      </div>
                      <div className="space-x-3">
                        <Button 
                          onClick={() => setShowExerciseDialog(false)}
                          className="bg-green-500 hover:bg-green-600 px-8"
                        >
                          继续下一题
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleCompleteExercise(selectedExercise)}
                        >
                          重新练习
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-lg font-medium text-gray-800">准备开始练习？</h4>
                        <p className="text-gray-600">
                          请仔细观察球型图，理解击球要求后开始练习
                        </p>
                      </div>
                      
                      <div className="flex justify-center space-x-3">
                        <Button 
                          onClick={() => handleCompleteExercise(selectedExercise)}
                          className="bg-blue-500 hover:bg-blue-600 px-8"
                        >
                          开始练习
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowExerciseDialog(false)}
                        >
                          稍后练习
                        </Button>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        💡 提示：按照图示要求完成练习后点击完成
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 练习记录 */}
                {selectedExercise.completed && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">练习记录</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>完成时间：{new Date().toLocaleDateString()}</div>
                      <div>练习次数：{Math.floor(Math.random() * 10) + 3} 次</div>
                      <div>成功率：{Math.floor(Math.random() * 30) + 70}%</div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}