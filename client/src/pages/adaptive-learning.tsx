import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, Target, TrendingUp, Star, Clock, ArrowRight } from "lucide-react";
import type { User } from "@shared/schema";

interface LearningPath {
  userId: number;
  currentLevel: number;
  recommendedExercises: number[];
  strengthAreas: string[];
  improvementAreas: string[];
  nextMilestone: {
    level: number;
    exercise: number;
    estimatedDays: number;
  };
}

interface ExerciseComplexity {
  level: number;
  exerciseNumber: number;
  complexityScore: number;
  difficultyCategory: "基础" | "中级" | "高级" | "专家";
  requiredAttempts: number;
  prerequisites: string[];
}

export default function AdaptiveLearning() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseComplexity, setExerciseComplexity] = useState<ExerciseComplexity | null>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: learningPath, isLoading } = useQuery<LearningPath>({
    queryKey: ["/api/adaptive-learning", 1],
    enabled: !!user,
  });

  const analyzeExerciseComplexity = async (exerciseKey: string) => {
    try {
      const response = await fetch("/api/exercise-complexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseKey }),
      });
      
      if (response.ok) {
        const complexity = await response.json();
        setExerciseComplexity(complexity);
      }
    } catch (error) {
      console.error("Failed to analyze exercise complexity:", error);
    }
  };

  const getDifficultyColor = (category: string) => {
    switch (category) {
      case "基础": return "bg-green-100 text-green-800";
      case "中级": return "bg-blue-100 text-blue-800";
      case "高级": return "bg-orange-100 text-orange-800";
      case "专家": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getComplexityProgress = (score: number) => {
    return (score / 4) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">智能学习路径</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Path Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              个性化推荐练习
            </CardTitle>
            <CardDescription>
              基于您的练习表现和习题复杂度分析的智能推荐
            </CardDescription>
          </CardHeader>
          <CardContent>
            {learningPath?.recommendedExercises.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {learningPath.recommendedExercises.map((exerciseNum) => {
                  const exerciseKey = `${learningPath.currentLevel}-${exerciseNum}`;
                  return (
                    <Card 
                      key={exerciseKey}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                      onClick={() => {
                        setSelectedExercise(exerciseKey);
                        analyzeExerciseComplexity(exerciseKey);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          第{exerciseNum}题
                        </div>
                        <div className="text-sm text-gray-600">
                          等级 {learningPath.currentLevel}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 w-full"
                        >
                          分析复杂度
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无推荐练习，请先完成一些基础练习
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              学习分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {learningPath?.strengthAreas.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-2">优势领域</h4>
                <div className="space-y-1">
                  {learningPath.strengthAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="bg-green-100 text-green-800">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {learningPath?.improvementAreas.length > 0 && (
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">待提升领域</h4>
                <div className="space-y-1">
                  {learningPath.improvementAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="bg-orange-100 text-orange-800">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {learningPath?.nextMilestone && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  下一个里程碑
                </h4>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm">
                    <strong>目标：</strong>等级 {learningPath.nextMilestone.level}
                  </div>
                  <div className="text-sm">
                    <strong>预计时间：</strong>{learningPath.nextMilestone.estimatedDays} 天
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exercise Complexity Analysis */}
      {exerciseComplexity && selectedExercise && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              习题复杂度分析 - 第{exerciseComplexity.exerciseNumber}题
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">难度等级</label>
                  <div className="mt-1">
                    <Badge className={getDifficultyColor(exerciseComplexity.difficultyCategory)}>
                      {exerciseComplexity.difficultyCategory}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">复杂度评分</label>
                  <div className="mt-1">
                    <Progress 
                      value={getComplexityProgress(exerciseComplexity.complexityScore)} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {exerciseComplexity.complexityScore}/4
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">要求次数</label>
                  <div className="mt-1 text-lg font-semibold">
                    {exerciseComplexity.requiredAttempts} 次
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">等级位置</label>
                  <div className="mt-1 text-lg font-semibold">
                    {exerciseComplexity.level}-{exerciseComplexity.exerciseNumber}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Button className="w-full" size="lg">
                  开始练习
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}