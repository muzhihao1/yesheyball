import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Zap, Crown, Lock, Play } from "lucide-react";

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

export default function LevelsSimple() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">用户信息加载失败</h2>
          <p className="text-gray-600 mt-2">请刷新页面重试</p>
        </div>
      </div>
    );
  }

  const getCompletedExercises = (level: number) => {
    if (!user.completedExercises) return 0;
    const exercises = user.completedExercises as Record<string, number>;
    return exercises[level.toString()] || 0;
  };

  const levelStages: LevelStage[] = [
    {
      level: 1,
      name: "初窥门径",
      totalExercises: 35,
      category: "启明星",
      description: "在启明星教准轨道，让台球成为你的第一颗卫星！台球技术基础框架搭建",
      unlocked: true,
      completed: user.level > 1,
      progress: user.level > 1 ? 100 : Math.min((user.exp / 1000) * 100, 95),
      completedExercises: getCompletedExercises(1)
    },
    {
      level: 2,
      name: "小有所成",
      totalExercises: 40,
      category: "启明星",
      description: "台球技术基础框架搭建",
      unlocked: user.level >= 2,
      completed: user.level > 2,
      progress: user.level > 2 ? 100 : user.level === 2 ? Math.min(((user.exp - 1000) / 1000) * 100, 95) : 0,
      completedExercises: getCompletedExercises(2)
    },
    {
      level: 3,
      name: "渐入佳境",
      totalExercises: 45,
      category: "超新星",
      description: "在超新星技能演化，让台球技术展现更强光芒！台球技术进阶发展",
      unlocked: user.level >= 3,
      completed: user.level > 3,
      progress: user.level > 3 ? 100 : user.level === 3 ? Math.min(((user.exp - 2000) / 1500) * 100, 95) : 0,
      completedExercises: getCompletedExercises(3)
    },
    {
      level: 4,
      name: "略有心得",
      totalExercises: 50,
      category: "超新星",
      description: "掌握基本技巧，开始理解台球运动的精髓",
      unlocked: user.level >= 4,
      completed: user.level > 4,
      progress: user.level > 4 ? 100 : user.level === 4 ? Math.min(((user.exp - 3500) / 2000) * 100, 95) : 0,
      completedExercises: getCompletedExercises(4)
    },
    {
      level: 5,
      name: "融会贯通",
      totalExercises: 55,
      category: "超新星",
      description: "技术动作趋于稳定，战术意识开始形成",
      unlocked: user.level >= 5,
      completed: user.level > 5,
      progress: user.level > 5 ? 100 : user.level === 5 ? Math.min(((user.exp - 5500) / 2500) * 100, 95) : 0,
      completedExercises: getCompletedExercises(5)
    },
    {
      level: 6,
      name: "炉火纯青",
      totalExercises: 60,
      category: "智子星",
      description: "在智子星层面突破，掌控台球的奥秘！高级技术运用自如",
      unlocked: user.level >= 6,
      completed: user.level > 6,
      progress: user.level > 6 ? 100 : user.level === 6 ? Math.min(((user.exp - 8000) / 3000) * 100, 95) : 0,
      completedExercises: getCompletedExercises(6)
    },
    {
      level: 7,
      name: "登峰造极",
      totalExercises: 65,
      category: "智子星",
      description: "技艺精湛，具备职业选手的基本水准",
      unlocked: user.level >= 7,
      completed: user.level > 7,
      progress: user.level > 7 ? 100 : user.level === 7 ? Math.min(((user.exp - 11000) / 3500) * 100, 95) : 0,
      completedExercises: getCompletedExercises(7)
    },
    {
      level: 8,
      name: "返璞归真",
      totalExercises: 70,
      category: "智子星",
      description: "技术与心理的完美结合，台球大师之路的起点",
      unlocked: user.level >= 8,
      completed: user.level > 8,
      progress: user.level > 8 ? 100 : user.level === 8 ? Math.min(((user.exp - 14500) / 4000) * 100, 95) : 0,
      completedExercises: getCompletedExercises(8)
    }
  ];

  const getLevelColors = (level: number) => {
    if (level <= 2) return { bg: 'bg-blue-50', border: 'border-blue-200', node: 'bg-blue-500', text: 'text-blue-700' };
    if (level <= 5) return { bg: 'bg-purple-50', border: 'border-purple-200', node: 'bg-purple-500', text: 'text-purple-700' };
    return { bg: 'bg-orange-50', border: 'border-orange-200', node: 'bg-orange-500', text: 'text-orange-700' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">训练等级</h1>
          <p className="text-gray-600">完成练习，提升技能，解锁新等级</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{user.level}</div>
              <div className="text-sm text-gray-600">当前等级</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{user.exp}</div>
              <div className="text-sm text-gray-600">经验值</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{user.completedTasks}</div>
              <div className="text-sm text-gray-600">完成任务</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Stages */}
        <div className="space-y-8">
          {levelStages.map((stage, stageIndex) => {
            const levelColors = getLevelColors(stage.level);
            
            return (
              <div key={stage.level} className="relative">
                <Card className={`${levelColors.bg} ${levelColors.border} border-2 ${!stage.unlocked ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-full ${levelColors.node} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                          {stage.level}
                        </div>
                        <div>
                          <CardTitle className={`text-xl ${levelColors.text}`}>{stage.name}</CardTitle>
                          <p className="text-gray-600 text-sm mt-1">{stage.description}</p>
                        </div>
                      </div>
                      <Badge variant={stage.category === "启明星" ? "default" : stage.category === "超新星" ? "secondary" : "destructive"}>
                        {stage.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">进度</span>
                          <span className={levelColors.text}>{Math.round(stage.progress)}%</span>
                        </div>
                        <Progress value={stage.progress} className="h-3" />
                      </div>

                      {/* Exercise Count */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          练习进度: {stage.completedExercises} / {stage.totalExercises}
                        </span>
                        <div className="flex space-x-2">
                          {stage.unlocked ? (
                            <Button size="sm" className={`${levelColors.node} hover:opacity-90 text-white`}>
                              <Play className="w-4 h-4 mr-1" />
                              开始练习
                            </Button>
                          ) : (
                            <Button size="sm" disabled>
                              <Lock className="w-4 h-4 mr-1" />
                              未解锁
                            </Button>
                          )}
                        </div>
                      </div>

                      {stage.completed && (
                        <div className="flex items-center justify-center pt-2">
                          <Badge variant="default" className="bg-green-500 text-white">
                            <Trophy className="w-4 h-4 mr-1" />
                            已完成
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Connection to Next Level */}
                {stageIndex < levelStages.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <div className={`w-1 h-8 ${levelStages[stageIndex + 1].unlocked ? getLevelColors(levelStages[stageIndex + 1].level).node : 'bg-gray-300'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}