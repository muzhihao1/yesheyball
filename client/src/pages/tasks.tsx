/**
 * Tasks/Training Plan Page - Ten Core Skills System
 *
 * 训练计划页面 - 十大招系统
 * 复用原有UI组件，使用skills_v3数据源
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { TrainingCompleteModal } from "@/components/TrainingCompleteModal";
import { RatingModal } from "@/components/RatingModal";
import { AiFeedbackModal } from "@/components/AiFeedbackModal";
import { AchievementUnlockModal } from "@/components/AchievementUnlockModal";
import { DailyGoalsPanel } from "@/components/DailyGoalsPanel";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Clock, Play, Pause, Square, Target, Star, TrendingUp, ChevronRight,
  Layers, Zap, Target as TargetIcon, Rotate3D, Compass, Route, Trophy, Grid3x3, BookOpen
} from "lucide-react";
import {
  useSkillsV3,
  useSubSkillsV3,
  useTrainingUnitsV3,
  useUserSkillProgressV3,
  useUserUnitCompletions,
  type SkillV3,
  type SubSkillV3,
  type TrainingUnitV3,
} from "@/hooks/useSkillsV3";

// Specialized Training Types
interface SpecializedTraining {
  id: string;
  title: string;
  description: string | null;
  iconName: string | null;
  category: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
}

interface TrainingPlan {
  id: string;
  trainingId: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  estimatedTimeMinutes: number | null;
  content: {
    objectives?: string[];
    steps?: string[];
    successCriteria?: string[];
    commonMistakes?: string[];
    tips?: string;
  } | null;
  xpReward: number | null;
  isActive: boolean | null;
}

// Helper function to get JWT auth headers
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const accessToken = localStorage.getItem('supabase_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

// Custom hook for specialized trainings
function useSpecializedTrainings() {
  return useQuery({
    queryKey: ['/api/specialized-trainings'],
    queryFn: async () => {
      const response = await fetch('/api/specialized-trainings', {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch specialized trainings');
      const data = await response.json();
      return (data.trainings || []) as SpecializedTraining[];
    },
  });
}

// Custom hook for training plans of a specific training
function useTrainingPlans(trainingId: string) {
  return useQuery({
    queryKey: [`/api/specialized-trainings/${trainingId}/plans`],
    queryFn: async () => {
      if (!trainingId) return [];
      const response = await fetch(`/api/specialized-trainings/${trainingId}/plans`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch training plans');
      const data = await response.json();
      return (data.plans || []) as TrainingPlan[];
    },
    enabled: !!trainingId,
  });
}

// Icon mapping for specialized trainings
const iconMap: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-8 h-8" />,
  Zap: <Zap className="w-8 h-8" />,
  Target: <TargetIcon className="w-8 h-8" />,
  Rotate3D: <Rotate3D className="w-8 h-8" />,
  Compass: <Compass className="w-8 h-8" />,
  Route: <Route className="w-8 h-8" />,
  Trophy: <Trophy className="w-8 h-8" />,
  Grid3x3: <Grid3x3 className="w-8 h-8" />,
};

// Helper function to format time
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function TasksPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Navigation state - which skill/subskill is currently selected
  const [selectedSkill, setSelectedSkill] = useState<SkillV3 | null>(null);
  const [selectedSubSkill, setSelectedSubSkill] = useState<SubSkillV3 | null>(null);

  // Specialized training navigation state
  const [selectedTraining, setSelectedTraining] = useState<SpecializedTraining | null>(null);
  const [selectedTrainingPlan, setSelectedTrainingPlan] = useState<TrainingPlan | null>(null);
  const [activeTrainingPlan, setActiveTrainingPlan] = useState<TrainingPlan | null>(null);

  // Training states
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [activeElapsedTime, setActiveElapsedTime] = useState(0);
  const [isTrainingPaused, setIsTrainingPaused] = useState(false);
  const [activeUnit, setActiveUnit] = useState<TrainingUnitV3 | null>(null);
  const [trainingNotes, setTrainingNotes] = useState("");

  // Modal states
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    sessionTitle: string;
    earnedExp: number;
    stars: number;
    duration: number;
  } | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAiFeedbackModal, setShowAiFeedbackModal] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Fetch ten core skills data
  const { data: skills = [], isLoading: skillsLoading } = useSkillsV3();
  const { data: userProgress = [], isLoading: progressLoading } = useUserSkillProgressV3();
  const { data: allCompletions = [] } = useUserUnitCompletions();

  // Fetch specialized trainings
  const { data: specializedTrainings = [] } = useSpecializedTrainings();

  // Fetch training plans for selected specialized training
  const { data: trainingPlans = [], isLoading: plansLoading } = useTrainingPlans(
    selectedTraining?.id || ""
  );

  // Fetch sub-skills for selected skill
  const { data: subSkills = [], isLoading: subSkillsLoading } = useSubSkillsV3(
    selectedSkill?.id || ""
  );

  // Fetch training units for selected sub-skill
  const { data: trainingUnits = [], isLoading: unitsLoading } = useTrainingUnitsV3(
    selectedSubSkill?.id || ""
  );

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTrainingActive && !isTrainingPaused) {
      interval = setInterval(() => {
        setActiveElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTrainingActive, isTrainingPaused]);

  // Calculate overall stats
  const totalSkills = skills.length;
  const completedSkills = userProgress.filter((p) => p.completedSubSkills >= 3).length;
  const totalXP = userProgress.reduce((sum, p) => sum + p.totalXpEarned, 0);
  const totalSubSkills = totalSkills * 3;
  const completedSubSkills = userProgress.reduce((sum, p) => sum + p.completedSubSkills, 0);
  const overallProgress = totalSubSkills > 0 ? Math.round((completedSubSkills / totalSubSkills) * 100) : 0;

  // Handle start training
  const handleStartTraining = (unit: TrainingUnitV3, skill: SkillV3, subSkill: SubSkillV3) => {
    setIsTrainingActive(true);
    setActiveUnit(unit);
    setActiveElapsedTime(0);
    setIsTrainingPaused(false);
    setTrainingNotes("");
    toast({
      title: "训练开始",
      description: `${skill.title} - ${subSkill.title} - ${unit.title}`,
    });
  };

  // Handle start specialized training
  const handleStartSpecializedTraining = (plan: TrainingPlan) => {
    console.log('[DEBUG] Starting specialized training:', plan.title);
    setIsTrainingActive(true);
    setActiveTrainingPlan(plan);
    setActiveElapsedTime(0);
    setIsTrainingPaused(false);
    setTrainingNotes("");
    // Clear ALL navigation states to return to main page where training interface is rendered
    setSelectedTrainingPlan(null);
    setSelectedTraining(null);
    setSelectedSkill(null);
    setSelectedSubSkill(null);
    console.log('[DEBUG] Cleared all navigation states');
    toast({
      title: "开始训练",
      description: `开始「${plan.title}」训练`,
    });
  };

  // Handle stop training
  const handleStopTraining = () => {
    if (!activeUnit && !activeTrainingPlan) return;

    // Show rating modal
    setShowRatingModal(true);
  };

  // Handle rating submission
  const handleRatingSubmit = async (rating: number, additionalFeedback?: string) => {
    setCurrentRating(rating);
    setShowRatingModal(false);

    const sessionTitle = activeUnit?.title || activeTrainingPlan?.title || "训练";
    const earnedExp = (activeTrainingPlan?.xpReward || 50) + rating * 10;

    // Show celebration first
    setCelebrationData({
      sessionTitle,
      earnedExp,
      stars: rating,
      duration: activeElapsedTime,
    });
    setShowCelebration(true);

    // Combine training notes with additional feedback
    const combinedNotes = [trainingNotes, additionalFeedback]
      .filter(Boolean)
      .join("\n") || "完成了训练";

    // Generate AI feedback in background
    try {
      const response = await fetch("/api/coaching-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: activeElapsedTime,
          notes: combinedNotes,
          rating: rating,
          sessionType: sessionTitle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiFeedback(data.feedback);
        // AI feedback will be shown after celebration modal closes
      }
    } catch (error) {
      console.error("Failed to generate AI feedback:", error);
      // Continue even if AI feedback fails
    }

    // Reset training state
    setIsTrainingActive(false);
    setActiveUnit(null);
    setActiveTrainingPlan(null);
    setActiveElapsedTime(0);
    setTrainingNotes("");
  };

  // Loading state
  if (skillsLoading || progressLoading) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Training plan detail view
  if (selectedTrainingPlan && selectedTraining) {
    const difficultyColors = {
      easy: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      hard: "bg-red-100 text-red-700",
    };

    return (
      <div className="p-4 space-y-6 pb-24">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => setSelectedTrainingPlan(null)}
          className="mb-4"
        >
          ← 返回训练计划列表
        </Button>

        {/* Plan Header */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{selectedTrainingPlan.title}</CardTitle>
                {selectedTrainingPlan.description && (
                  <p className="text-sm text-gray-600 mt-2">{selectedTrainingPlan.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                {selectedTrainingPlan.difficulty && (
                  <Badge className={difficultyColors[selectedTrainingPlan.difficulty as keyof typeof difficultyColors]}>
                    {selectedTrainingPlan.difficulty === 'easy' ? '入门' :
                     selectedTrainingPlan.difficulty === 'medium' ? '中级' : '高级'}
                  </Badge>
                )}
                {selectedTrainingPlan.estimatedTimeMinutes && (
                  <Badge className="bg-blue-100 text-blue-700">
                    ⏱️ {selectedTrainingPlan.estimatedTimeMinutes} 分钟
                  </Badge>
                )}
                {selectedTrainingPlan.xpReward && (
                  <Badge className="bg-purple-100 text-purple-700">
                    ⭐ +{selectedTrainingPlan.xpReward} XP
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Plan Content */}
        {selectedTrainingPlan.content && (
          <div className="space-y-4">
            {/* Objectives */}
            {selectedTrainingPlan.content.objectives && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🎯 训练目标</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {selectedTrainingPlan.content.objectives.map((obj, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{obj}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Steps */}
            {selectedTrainingPlan.content.steps && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📝 训练步骤</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-3">
                    {selectedTrainingPlan.content.steps.map((step, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{step}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Success Criteria */}
            {selectedTrainingPlan.content.successCriteria && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">✅ 成功标准</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {selectedTrainingPlan.content.successCriteria.map((criteria, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{criteria}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Common Mistakes */}
            {selectedTrainingPlan.content.commonMistakes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">⚠️ 常见错误</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {selectedTrainingPlan.content.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="text-sm text-red-600">{mistake}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            {selectedTrainingPlan.content.tips && (
              <Card className="bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-base">💡 训练提示</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{selectedTrainingPlan.content.tips}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Start Training Button */}
        <Button
          size="lg"
          className="w-full bg-purple-600 hover:bg-purple-700"
          onClick={() => handleStartSpecializedTraining(selectedTrainingPlan)}
        >
          开始训练
        </Button>
      </div>
    );
  }

  // Training plans list view
  if (selectedTraining) {
    console.log('[DEBUG] Rendering training plans list for:', selectedTraining.title);
    return (
      <div className="p-4 space-y-6 pb-24">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => setSelectedTraining(null)}
          className="mb-4"
        >
          ← 返回道场列表
        </Button>

        {/* Selected Training Header */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="text-purple-600">
                {selectedTraining.iconName && iconMap[selectedTraining.iconName] || <Target className="w-8 h-8" />}
              </div>
              <div>
                <CardTitle className="text-lg text-purple-800">{selectedTraining.title}</CardTitle>
                {selectedTraining.description && (
                  <p className="text-sm text-purple-700 mt-1">{selectedTraining.description}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Training Plans List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">训练计划列表</h3>
          {plansLoading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : trainingPlans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无训练计划</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingPlans.map((plan) => {
                const difficultyColors = {
                  easy: "bg-green-100 text-green-700",
                  medium: "bg-yellow-100 text-yellow-700",
                  hard: "bg-red-100 text-red-700",
                };

                return (
                  <Card
                    key={plan.id}
                    className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all border-purple-200"
                    onClick={() => setSelectedTrainingPlan(plan)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{plan.title}</CardTitle>
                        {plan.difficulty && (
                          <Badge className={difficultyColors[plan.difficulty as keyof typeof difficultyColors]}>
                            {plan.difficulty === 'easy' ? '入门' :
                             plan.difficulty === 'medium' ? '中级' : '高级'}
                          </Badge>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {plan.estimatedTimeMinutes && (
                          <span>⏱️ {plan.estimatedTimeMinutes} 分钟</span>
                        )}
                        {plan.xpReward && (
                          <span>⭐ +{plan.xpReward} XP</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // No navigation selection - show skills overview
  if (!selectedSkill) {
    console.log('[DEBUG] Rendering main overview. isTrainingActive:', isTrainingActive, 'activeTrainingPlan:', activeTrainingPlan?.title);
    return (
      <div className="p-4 space-y-6 pb-24">
        {/* Guidance Alert */}
        <Alert className="border-blue-200 bg-blue-50/50">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">📚 技能库 - 系统复习</AlertTitle>
          <AlertDescription className="text-blue-700 space-y-2">
            <p><strong>完成【挑战】主线任务后</strong>，来这里：</p>
            <div className="text-xs space-y-1 ml-4">
              <p>• 查阅十大招完整理论和技术要点</p>
              <p>• 复习巩固已学内容，加深理解</p>
              <p>• 薄弱环节？下滑到【专项训练道场】针对性突破</p>
              <p>• 想验证能力？前往练习场做题测试</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Daily Goals Panel */}
        <DailyGoalsPanel />

        {/* Ten Core Skills Header */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-lg text-blue-800">傅家俊十大招系统训练</CardTitle>
                  <p className="text-sm text-blue-700 mt-1">系统化技能提升路径</p>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white">
                {completedSkills} / {totalSkills} 完成
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Overall Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">总体进度</span>
                <span className="font-semibold text-blue-600">{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>{completedSubSkills} / {totalSubSkills} 子技能</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{totalXP} XP</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => {
            const progress = userProgress.find((p) => p.skillId === skill.id);
            const skillProgress = progress?.completedSubSkills || 0;
            const isCompleted = skillProgress >= 3;

            return (
              <Card
                key={skill.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                  isCompleted ? "border-green-300 bg-green-50/50" : "border-gray-200"
                }`}
                onClick={() => setSelectedSkill(skill)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <span>{skill.title}</span>
                        {isCompleted && <Badge className="bg-green-600 text-white text-xs">已完成</Badge>}
                      </CardTitle>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{skill.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>子技能进度</span>
                      <span className="font-semibold">{skillProgress} / 3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${(skillProgress / 3) * 100}%` }}
                      />
                    </div>
                    {progress && (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{progress.totalXpEarned} XP</span>
                        <span>{progress.completedUnits} 单元已完成</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Specialized Training Arena */}
        {specializedTrainings.length > 0 && (
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Trophy className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle className="text-lg text-purple-800">🎯 专项训练道场 - 针对性突破</CardTitle>
                  <p className="text-sm text-purple-700 mt-1">
                    从十大招中精选的<strong>重点训练内容</strong>，哪里薄弱练哪里！
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {specializedTrainings
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((training) => (
                    <Card
                      key={training.id}
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.05] border-purple-200 bg-white"
                      onClick={() => {
                        console.log('[DEBUG] Clicked specialized training:', training.title);
                        setSelectedTraining(training);
                      }}
                    >
                      <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                        <div className="text-purple-600">
                          {training.iconName && iconMap[training.iconName] || <Target className="w-8 h-8" />}
                        </div>
                        <h4 className="font-semibold text-sm text-gray-800">{training.title}</h4>
                        {training.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{training.description}</p>
                        )}
                        {training.category && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {training.category}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <TrainingCompleteModal
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            // Show AI feedback after celebration if available
            if (aiFeedback) {
              setShowAiFeedbackModal(true);
            }
          }}
          sessionTitle={celebrationData?.sessionTitle || ""}
          earnedExp={celebrationData?.earnedExp || 0}
          stars={celebrationData?.stars || 0}
          duration={celebrationData?.duration}
        />
        {showAiFeedbackModal && (
          <AiFeedbackModal
            onClose={() => {
              setShowAiFeedbackModal(false);
              setAiFeedback(""); // Clear feedback after closing
            }}
            feedback={aiFeedback}
            rating={currentRating}
          />
        )}
        <AchievementUnlockModal
          isOpen={showAchievementModal}
          onClose={() => setShowAchievementModal(false)}
          achievements={unlockedAchievements}
        />
      </div>
    );
  }

  // Sub-skill selected - show training units
  if (selectedSubSkill) {
    return (
      <div className="p-4 space-y-6 pb-24">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => setSelectedSubSkill(null)}
          className="mb-4"
        >
          ← 返回子技能列表
        </Button>

        {/* Selected Sub-Skill Header */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>{selectedSubSkill.title}</CardTitle>
            <p className="text-sm text-gray-600">{selectedSubSkill.description}</p>
          </CardHeader>
        </Card>

        {/* Training units */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">训练单元</h3>
          {unitsLoading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : trainingUnits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无训练单元数据</div>
          ) : (
            trainingUnits.map((unit) => {
              const isCompleted = allCompletions.some((c) => c.unitId === unit.id);
              const unitTypeMap = {
                theory: { label: "理论", color: "bg-blue-100 text-blue-700" },
                practice: { label: "实践", color: "bg-green-100 text-green-700" },
                challenge: { label: "挑战", color: "bg-orange-100 text-orange-700" },
              };
              const typeInfo = unitTypeMap[unit.unitType];

              return (
                <Card
                  key={unit.id}
                  className={`border-gray-200 ${
                    isCompleted ? "bg-green-50" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                          {isCompleted && (
                            <Badge className="bg-green-500 text-white">✓ 已完成</Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm mb-1">{unit.title}</p>
                        <p className="text-xs text-gray-600 mb-2">
                          {unit.goalDescription}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>⭐ +{unit.xpReward} XP</span>
                          {unit.estimatedMinutes && (
                            <span>⏱️ 约 {unit.estimatedMinutes} 分钟</span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStartTraining(unit, selectedSkill!, selectedSubSkill)
                        }
                        disabled={isTrainingActive}
                        variant={isCompleted ? "outline" : "default"}
                      >
                        {isCompleted ? "重新训练" : "开始训练"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Active Training Interface */}
        {isTrainingActive && (activeUnit || activeTrainingPlan) && (
          <Card className="border-primary border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{activeUnit?.title || activeTrainingPlan?.title}</span>
                <Badge variant="outline" className="text-lg">
                  {formatTime(activeElapsedTime)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Unit content */}
              {activeUnit?.content && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {typeof activeUnit.content === "string"
                      ? activeUnit.content
                      : activeUnit.content.text || ""}
                  </p>
                </div>
              )}
              {activeTrainingPlan?.description && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{activeTrainingPlan.description}</p>
                </div>
              )}

              {/* Training controls */}
              <div className="flex gap-2">
                {!isTrainingPaused ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsTrainingPaused(true)}
                    className="flex-1"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    暂停
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsTrainingPaused(false)}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    继续
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleStopTraining}
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  结束训练
                </Button>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  训练笔记（可选）
                </label>
                <Textarea
                  value={trainingNotes}
                  onChange={(e) => setTrainingNotes(e.target.value)}
                  placeholder="记录训练中的感受、发现或问题..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        {showRatingModal && (activeUnit || activeTrainingPlan) && (
          <RatingModal
            sessionType={activeUnit?.title || activeTrainingPlan?.title || "训练"}
            duration={activeElapsedTime}
            notes={trainingNotes}
            onCancel={() => setShowRatingModal(false)}
            onSubmit={handleRatingSubmit}
          />
        )}

        {showAiFeedbackModal && (
          <AiFeedbackModal
            onClose={() => {
              setShowAiFeedbackModal(false);
              setAiFeedback(""); // Clear feedback after closing
            }}
            feedback={aiFeedback}
            rating={currentRating}
          />
        )}

        <TrainingCompleteModal
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            setCelebrationData(null);
          }}
          sessionTitle={celebrationData?.sessionTitle || ""}
          earnedExp={celebrationData?.earnedExp || 0}
          stars={celebrationData?.stars || 0}
          duration={celebrationData?.duration}
        />

        <AchievementUnlockModal
          isOpen={showAchievementModal}
          onClose={() => setShowAchievementModal(false)}
          achievements={unlockedAchievements}
        />
      </div>
    );
  }

  // Skill selected - show sub-skills
  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Back button */}
      <Button variant="ghost" onClick={() => setSelectedSkill(null)} className="mb-4">
        ← 返回技能列表
      </Button>

      {/* Selected Skill Header */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle>{selectedSkill.title}</CardTitle>
          <p className="text-sm text-gray-600">{selectedSkill.description}</p>
        </CardHeader>
      </Card>

      {/* Sub-skills */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">子技能列表</h3>
        {subSkillsLoading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : subSkills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暂无子技能数据</div>
        ) : (
          subSkills.map((subSkill) => (
            <Card
              key={subSkill.id}
              className="border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
              onClick={() => setSelectedSubSkill(subSkill)}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{subSkill.title}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </CardTitle>
                <p className="text-sm text-gray-600">{subSkill.description}</p>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Active Training Interface */}
      {isTrainingActive && activeUnit && (
        <Card className="border-primary border-2">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Timer Display */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-mono text-2xl font-bold text-primary">
                      {formatTime(activeElapsedTime)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsTrainingPaused(!isTrainingPaused)}
                      variant="outline"
                      size="sm"
                    >
                      {isTrainingPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Training Notes */}
                <div className="p-4 bg-background rounded-lg border mb-4">
                  <h4 className="text-sm font-medium text-primary mb-2">训练心得记录</h4>
                  <Textarea
                    value={trainingNotes}
                    onChange={(e) => setTrainingNotes(e.target.value)}
                    placeholder="记录这次训练的收获、发现的问题或需要改进的地方..."
                    className="h-20 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setIsTrainingActive(false);
                      setActiveUnit(null);
                      setActiveElapsedTime(0);
                      setTrainingNotes("");
                      toast({
                        title: "训练已取消",
                        description: "记得下次继续加油！",
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    取消
                  </Button>
                  <Button onClick={handleStopTraining} className="flex-1">
                    完成训练
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <TrainingCompleteModal
        isOpen={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          // Show AI feedback after celebration if available
          if (aiFeedback) {
            setShowAiFeedbackModal(true);
          }
        }}
        sessionTitle={celebrationData?.sessionTitle || ""}
        earnedExp={celebrationData?.earnedExp || 0}
        stars={celebrationData?.stars || 0}
        duration={celebrationData?.duration}
      />
      {showRatingModal && activeUnit && (
        <RatingModal
          sessionType={activeUnit.title}
          duration={activeElapsedTime}
          notes={trainingNotes}
          onCancel={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
      {showAiFeedbackModal && (
        <AiFeedbackModal
          onClose={() => {
            setShowAiFeedbackModal(false);
            setAiFeedback(""); // Clear feedback after closing
          }}
          feedback={aiFeedback}
          rating={currentRating}
        />
      )}
      <AchievementUnlockModal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        achievements={unlockedAchievements}
      />
    </div>
  );
}
