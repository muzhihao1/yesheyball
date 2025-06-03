import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, Trophy, Target, Zap, Crown, Lock } from "lucide-react";
import exerciseRequirementsData from "@/data/exerciseRequirements.json";
import exerciseDescriptionsData from "@/data/exerciseDescriptions.json";

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
  requirement: string;
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
    return <div className="text-center py-8">用户数据加载失败</div>;
  }

  // 基于实际验证数据的等级关卡配置 (总计411个习题)
  const levelStages: LevelStage[] = [
    {
      level: 1,
      name: "初窥门径",
      totalExercises: 35,
      category: "启明星",
      description: "在启明星教准轨道，让台球成为你的第一颗卫星！台球技术基础框架搭建",
      unlocked: true,
      completed: user.level > 1,
      progress: user.level > 1 ? 100 : Math.min((user.exp / 100) * 100, 95),
      completedExercises: user.level > 1 ? 35 : Math.floor((user.exp / 100) * 35)
    },
    {
      level: 2,
      name: "小有所成",
      totalExercises: 40,
      category: "启明星",
      description: "台球技术基础框架搭建",
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
      description: "在超新星的引力场中，精准控制每一次撞击！",
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
      description: "在智子星的宏观维度，用一杆终结所有因果链！台球桌上的战略思维",
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

  const getCategoryColor = (category: string) => {
    switch(category) {
      case "启明星": return "from-blue-500 via-blue-600 to-indigo-600";
      case "超新星": return "from-purple-500 via-violet-600 to-purple-700";
      case "智子星": return "from-orange-500 via-red-500 to-red-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "启明星": return <Star className="w-6 h-6" />;
      case "超新星": return <Zap className="w-6 h-6" />;
      case "智子星": return <Crown className="w-6 h-6" />;
      default: return <Trophy className="w-6 h-6" />;
    }
  };

  const getExerciseRequirement = (level: number, exerciseNumber: number): string => {
    const key = `${level}-${exerciseNumber}`;
    return exerciseRequirementsData[key as keyof typeof exerciseRequirementsData] || "连续完成5次不失误";
  };

  const getExerciseDescription = (level: number, exerciseNumber: number): string => {
    const key = `${level}-${exerciseNumber}`;
    const specificDescription = exerciseDescriptionsData[key as keyof typeof exerciseDescriptionsData];
    
    if (specificDescription) {
      return specificDescription;
    }
    
    // 为其他等级提供基础描述
    if (level === 2) {
      return "如图示摆放球型，练习中等难度的球型处理和技巧提升";
    } else if (level === 3) {
      return "如图示摆放球型，掌握进阶走位控球技巧和复杂球局处理";
    } else if (level === 4) {
      return "如图示摆放球型，练习高难度球型和精准控制技术";
    } else if (level === 5) {
      return "如图示摆放球型，掌握登堂入室级别的技术要求";
    } else if (level === 6) {
      return "如图示摆放球型，挑战超群绝伦的复杂球局";
    } else if (level === 7) {
      return "如图示摆放球型，达到登峰造极的技术境界";
    } else if (level === 8) {
      return "如图示摆放球型，追求出神入化的完美技艺";
    }
    
    return "如图示摆放球型，将白球击入指定袋内";
  };



  const generateExercisesForLevel = (level: number): Exercise[] => {
    const stage = levelStages.find(s => s.level === level);
    if (!stage) return [];

    const exercises: Exercise[] = [];
    const levelName = stage.name;
    
    for (let i = 0; i < stage.totalExercises; i++) {
      const exerciseNum = i + 1;
      const imageFileNumber = (exerciseNum + 1).toString().padStart(2, '0'); // 图片文件从02开始
      
      exercises.push({
        id: `${level}-${exerciseNum}`,
        level,
        exerciseNumber: exerciseNum,
        title: `第${exerciseNum}题`,
        description: getExerciseDescription(level, exerciseNum),
        requirement: getExerciseRequirement(level, exerciseNum),
        imageUrl: `/assessments/${level}、${levelName}/${level}、${levelName}_${imageFileNumber}.jpg`,
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

  const handleExerciseClick = async (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDialog(true);
  };

  const handleCompleteExercise = async (exercise: Exercise) => {
    try {
      const stars = Math.floor(Math.random() * 3) + 1;
      const practiceTime = Math.floor(Math.random() * 30) + 15;
      
      const diaryContent = `完成了${exercise.title}练习，获得${stars}星评价。${
        stars === 3 ? '表现优秀！掌握了关键技术要点。' : 
        stars === 2 ? '进步明显，继续努力完善技巧！' : 
        '基础掌握，需要更多练习来提高稳定性。'
      }`;
      
      await apiRequest("/api/diary", "POST", {
        content: diaryContent,
        rating: stars,
        duration: practiceTime,
      });
      
      if (selectedExercise) {
        selectedExercise.completed = true;
        selectedExercise.stars = stars;
      }
      
      toast({
        title: "练习完成！",
        description: `恭喜完成 ${exercise.title}，获得 ${stars} 星评价！练习记录已保存到日记。`,
      });
      
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
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent mb-4">
            台球大师之路
          </h1>
          <div className="absolute -top-2 -right-8 text-2xl">🎱</div>
        </div>
        <p className="text-gray-700 text-lg mb-6">通过耶氏台球学院系列练习，系统化提升中式八球技术水平</p>
        
        <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-6 py-3 shadow-md">
          <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
          <span className="text-gray-800 font-semibold">
            当前等级: {user.level} - {levelStages.find(s => s.level === user.level)?.name}
          </span>
        </div>
      </div>

      {/* 多邻国风格的垂直滚动关卡地图 */}
      <div className="max-w-md mx-auto bg-gradient-to-b from-green-50 to-blue-50 rounded-xl p-6">
        {/* 用户进度显示 */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-800 text-lg">{user.username}</div>
              <div className="text-sm text-gray-600 flex items-center">
                <Target className="w-4 h-4 mr-1" />
                等级 {user.level} - {levelStages.find(s => s.level === user.level)?.name}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-orange-500">{user.exp}</div>
            <div className="text-xs text-gray-500 flex items-center justify-end">
              <Star className="w-3 h-3 mr-1" />
              经验值
            </div>
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
                    <div className="font-bold">{stage.completedExercises}/{stage.totalExercises}</div>
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
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg ${
                          !isUnlocked 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : exercise.completed 
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white transform scale-105' 
                              : 'bg-gradient-to-br from-white to-green-50 border-4 border-green-500 text-green-600 hover:scale-110 hover:shadow-xl'
                        }`}
                        onClick={() => isUnlocked && handleExerciseClick(exercise)}
                      >
                        {!isUnlocked ? (
                          <Lock className="w-6 h-6" />
                        ) : exercise.completed ? (
                          <Star className="w-8 h-8 fill-white" />
                        ) : (
                          <span className="text-lg font-bold">{exercise.exerciseNumber}</span>
                        )}
                        
                        {/* 星星评分 */}
                        {exercise.completed && exercise.stars > 0 && (
                          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full px-1.5 py-0.5 text-xs font-bold text-yellow-900 min-w-[20px] text-center">
                            {exercise.stars}
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
                <DialogDescription>
                  通过耶氏台球学院系列练习，系统化提升中式八球技术水平
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* 练习图片和说明 */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 左侧：题目说明 */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <h3 className="font-bold text-blue-700 mb-2">题目说明：</h3>
                      <p className="text-gray-700">{selectedExercise.description}</p>
                    </div>
                    
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                      <h3 className="font-bold text-orange-700 mb-2">过关要求：</h3>
                      <p className="text-gray-700">
                        {getExerciseRequirement(selectedExercise.level, selectedExercise.exerciseNumber)}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                      <h3 className="font-bold text-green-700 mb-2">技术要点：</h3>
                      <ul className="text-gray-700 text-sm space-y-1">
                        {selectedExercise.level <= 3 ? (
                          <>
                            <li>• 控制击球力度，确保白球准确入袋</li>
                            <li>• 注意瞄准角度和击球点位</li>
                            <li>• 保持稳定的出杆动作</li>
                          </>
                        ) : selectedExercise.level <= 6 ? (
                          <>
                            <li>• 掌握复杂球型的处理技巧</li>
                            <li>• 提高击球的精确度和稳定性</li>
                            <li>• 学会预判和规划下一步走位</li>
                          </>
                        ) : (
                          <>
                            <li>• 运用高级技术处理困难球局</li>
                            <li>• 发展战略思维和全局观</li>
                            <li>• 追求技术与艺术的完美结合</li>
                          </>
                        )}
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
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerHTML = `
                              <div class="w-full h-64 bg-green-600 border-8 border-amber-800 rounded-lg flex items-center justify-center relative">
                                <div class="absolute top-2 left-2 w-3 h-3 bg-black rounded-full"></div>
                                <div class="absolute top-2 right-2 w-3 h-3 bg-black rounded-full"></div>
                                <div class="absolute bottom-2 left-2 w-3 h-3 bg-black rounded-full"></div>
                                <div class="absolute bottom-2 right-2 w-3 h-3 bg-black rounded-full"></div>
                                <div class="absolute top-1/2 left-2 w-3 h-3 bg-black rounded-full transform -translate-y-1/2"></div>
                                <div class="absolute top-1/2 right-2 w-3 h-3 bg-black rounded-full transform -translate-y-1/2"></div>
                                <div class="w-4 h-4 bg-white rounded-full"></div>
                                <div class="absolute top-4 right-4 w-4 h-4 bg-black rounded-full border-2 border-red-500"></div>
                                <div class="absolute inset-0 opacity-20" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px);"></div>
                              </div>
                            `;
                          }
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