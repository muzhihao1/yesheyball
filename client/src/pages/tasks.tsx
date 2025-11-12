import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrainingCompleteModal } from "@/components/TrainingCompleteModal";
import { RatingModal } from "@/components/RatingModal";
import { AiFeedbackModal } from "@/components/AiFeedbackModal";
import { AchievementUnlockModal } from "@/components/AchievementUnlockModal";
import { DailyGoalsPanel } from "@/components/DailyGoalsPanel";
import { LevelAccordion } from "@/components/LevelAccordion";
import { NinetyDayProgressBar } from "@/components/NinetyDayProgressBar";
import { DayCurriculumCard } from "@/components/DayCurriculumCard";
import { SpecializedTrainingCard } from "@/components/SpecializedTrainingCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Play, Pause, Square, BookOpen, Target, Zap, Star, Trophy, TrendingUp } from "lucide-react";
import { useTrainingPath, useUpdateProgress, useTrainingPathStats } from "@/hooks/useAdvancedTraining";
import { useNinetyDayProgress, useCurrentDayCurriculum, useCompleteDay, isDayCompleted, useNinetyDaySpecializedTraining } from "@/hooks/useNinetyDayTraining";

export default function Tasks() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Training states - Unified for 30-day, 90-day, and Level 4-8
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [activeElapsedTime, setActiveElapsedTime] = useState(0);
  const [isTrainingPaused, setIsTrainingPaused] = useState(false);
  const [activeTrainingType, setActiveTrainingType] = useState<'30day' | '90day' | 'advanced' | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [activeDayId, setActiveDayId] = useState<number | null>(null);
  const [active90DayNumber, setActive90DayNumber] = useState<number | null>(null);
  
  // Training completion states
  const [trainingNotes, setTrainingNotes] = useState("");
  const [currentSessionType, setCurrentSessionType] = useState("");

  // Celebration modal states
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    sessionTitle: string;
    earnedExp: number;
    stars: number;
    duration: number;
  } | null>(null);

  // Rating and AI feedback states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAiFeedbackModal, setShowAiFeedbackModal] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [currentRating, setCurrentRating] = useState<number>(0);

  // Achievement unlock states
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Get training programs with error handling
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["/api/training-programs"],
    retry: 1,
    staleTime: 10 * 60 * 1000,
  });

  const programsArray = Array.isArray(programs) ? programs : [];
  const mainProgram = programsArray.find((p: any) => p?.name === "耶氏台球学院系统教学");
  
  // Get training days with error handling
  const { data: trainingDays = [], isLoading: daysLoading } = useQuery({
    queryKey: [`/api/training-programs/${mainProgram?.id}/days`],
    enabled: !!mainProgram?.id,
    retry: 1,
    staleTime: 15 * 60 * 1000,
  });

  const trainingDaysArray = Array.isArray(trainingDays) ? trainingDays : [];

  // Get training records for display
  const { data: trainingRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/training-records"],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const recordsArray = Array.isArray(trainingRecords) ? trainingRecords : [];

  // Get V2.1 training path data for advanced training (Level 4-8)
  const { data: trainingPathData, isLoading: pathLoading } = useTrainingPath();
  const { mutate: updateProgress } = useUpdateProgress();
  const stats = useTrainingPathStats(trainingPathData);

  // Get 90-day training system data
  const { data: ninetyDayProgress, isLoading: ninetyDayProgressLoading } = useNinetyDayProgress();
  const ninetyDayCurrentDay = ninetyDayProgress?.currentDay || 1;
  const { data: currentDayCurriculumData, isLoading: currentDayLoading } = useCurrentDayCurriculum(ninetyDayCurrentDay);
  const { mutate: completeDay } = useCompleteDay();
  const currentDayCurriculum = currentDayCurriculumData?.curriculum?.[0];
  const { data: specializedTrainingData, isLoading: specializedLoading } = useNinetyDaySpecializedTraining();
  const specializedTrainings = specializedTrainingData?.trainings || [];


  // Unified timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTrainingActive && !isTrainingPaused) {
      interval = setInterval(() => {
        setActiveElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTrainingActive, isTrainingPaused]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Difficulty badge helper
  const getDifficultyBadge = (day: number) => {
    if (day <= 17) return { label: "初级", color: "bg-green-100 text-green-800" };
    if (day <= 34) return { label: "中级", color: "bg-yellow-100 text-yellow-800" };
    return { label: "高级", color: "bg-red-100 text-red-800" };
  };

  // Reset training states
  const resetTrainingStates = () => {
    setIsTrainingActive(false);
    setActiveElapsedTime(0);
    setIsTrainingPaused(false);
    setActiveTrainingType(null);
    setActiveUnitId(null);
    setActiveDayId(null);
  };

  // Training control handlers
  const handleStartTraining = (type: '30day' | 'advanced', title: string, unitId?: string) => {
    if (isTrainingActive) {
      toast({
        title: "无法开始训练",
        description: "请先完成或取消当前训练",
        variant: "destructive"
      });
      return;
    }

    setCurrentSessionType("系统训练");
    setActiveTrainingType(type);
    setIsTrainingActive(true);
    setActiveElapsedTime(0);
    setIsTrainingPaused(false);

    if (type === '30day') {
      setActiveDayId(currentDay);
    } else if (type === 'advanced' && unitId) {
      setActiveUnitId(unitId);
    }

    toast({
      title: "系统训练开始",
      description: title
    });
  };

  const handleStopTraining = () => {
    // Open rating modal instead of old dialog
    setShowRatingModal(true);
  };

  // New: Handle rating submission with AI feedback
  const handleRatingSubmit = async (rating: number, userFeedback?: string) => {
    try {
      setShowRatingModal(false);

      const duration = activeElapsedTime;

      // Build session title and description based on training type
      let title = "系统训练";
      let description = "";

      if (activeTrainingType === '30day') {
        title = `第${currentDay}集：${currentDayTraining?.title || "训练"}`;
        description = currentDayTraining?.description || "";
      } else if (activeTrainingType === '90day' && active90DayNumber && currentDayCurriculum) {
        title = `第${active90DayNumber}天：${currentDayCurriculum.title}`;
        description = currentDayCurriculum.description || "十大招系统训练";
      } else if (activeTrainingType === 'advanced' && activeUnitId) {
        title = `进阶训练单元：${activeUnitId}`;
        description = "十大招精通 - 进阶系统训练";
      }

      const sessionData = {
        title,
        description,
        sessionType: "guided", // All system training is guided
        duration,
        notes: trainingNotes + (userFeedback ? `\n补充：${userFeedback}` : ''),
        rating,
        programId: activeTrainingType === '30day' ? mainProgram?.id : undefined,
        dayId: activeTrainingType === '30day' ? currentDayTraining?.day : undefined
      };

      // Create training session
      const response = await apiRequest("/api/training-sessions", "POST", {
        ...sessionData,
        completed: true
      });
      const data = await response.json();

      // If 90-day training, complete the day
      if (activeTrainingType === '90day' && active90DayNumber) {
        completeDay({
          dayNumber: active90DayNumber,
          duration,
          rating,
          notes: sessionData.notes || undefined
        }, {
          onSuccess: (completionData) => {
            console.log('90-day training completed:', completionData);
          },
          onError: (error) => {
            console.error('Failed to complete 90-day training:', error);
            toast({
              title: "进度更新失败",
              description: "训练已记录，但进度更新失败",
              variant: "destructive"
            });
          }
        });
      }

      // If advanced training (十大招), update progress
      if (activeTrainingType === 'advanced' && activeUnitId) {
        await apiRequest("/api/v2/user-progress", "POST", {
          unitId: activeUnitId,
          status: 'completed',
          progressData: {
            completedAt: new Date().toISOString(),
            rating,
            duration
          }
        });
      }

      // Check for achievement unlocks
      const achievementResponse = await apiRequest("/api/check-achievements", "POST", {});
      const newAchievements = await achievementResponse.json();
      if (newAchievements && newAchievements.length > 0) {
        setUnlockedAchievements(newAchievements);
      }

      // Generate AI feedback
      const feedbackResponse = await apiRequest("/api/coaching-feedback", "POST", {
        sessionType: currentSessionType,
        duration,
        rating,
        notes: sessionData.notes
      });
      const feedbackData = await feedbackResponse.json();

      // Save the rating and feedback
      setCurrentRating(rating);
      setAiFeedback(feedbackData.feedback || "");

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/training-programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals/daily"] }); // Refresh daily goals

      // Calculate experience points
      const baseExp = 50;
      const durationBonus = Math.floor(duration / 10) * 5;
      const ratingBonus = rating * 20;
      const earnedExp = baseExp + durationBonus + ratingBonus;

      // Set celebration modal data
      setCelebrationData({
        sessionTitle: sessionData.title,
        earnedExp,
        stars: rating,
        duration: Math.floor(duration / 60)
      });

      // Reset training states
      setTrainingNotes("");
      resetTrainingStates();

      // Show celebration modal first
      setShowCelebration(true);

      // Show AI feedback modal after celebration (with delay)
      setTimeout(() => {
        if (feedbackData.feedback) {
          setShowAiFeedbackModal(true);
        }
      }, 3000); // Show AI feedback 3 seconds after celebration starts

    } catch (error: any) {
      console.error("Rating submission error:", error);
      toast({
        title: "保存失败",
        description: error.message || "训练记录保存失败，请重试",
        variant: "destructive"
      });
      // Reopen rating modal on error
      setShowRatingModal(true);
    }
  };


  // Loading state
  if (programsLoading || daysLoading) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (!mainProgram) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">训练计划加载中...</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              刷新页面
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe data access - use user's currentDay instead of program's currentDay
  // This ensures each user has their own training progression
  const currentDay = (user as any)?.currentDay || 1;
  const currentEpisode = `第${currentDay}集`;
  const difficultyBadge = getDifficultyBadge(currentDay);
  const currentDayTraining = trainingDaysArray.find((day: any) => day?.day === currentDay);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Daily Goals Section */}
      <DailyGoalsPanel />

      {/* System Training Section - Unified 90-Day Training System */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle className="text-lg text-green-800">傅家俊十大招系统训练</CardTitle>
                <p className="text-sm text-green-700 mt-1">90天系统化训练计划</p>
              </div>
            </div>
            {ninetyDayProgress && (
              <Badge className="bg-green-600 text-white">
                第 {ninetyDayCurrentDay} 天
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <NinetyDayProgressBar />

          {/* Current Day Training Card */}
          {ninetyDayProgressLoading || currentDayLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-4">加载训练内容...</p>
            </div>
          ) : currentDayCurriculum ? (
            <DayCurriculumCard
              curriculum={currentDayCurriculum}
              isCompleted={isDayCompleted(ninetyDayProgress, ninetyDayCurrentDay)}
              isCurrent={true}
              onStartTraining={() => {
                setIsTrainingActive(true);
                setActiveTrainingType('90day');
                setActive90DayNumber(ninetyDayCurrentDay);
                setActiveElapsedTime(0);
                setIsTrainingPaused(false);
                setCurrentSessionType(`第${ninetyDayCurrentDay}天 - ${currentDayCurriculum.title}`);
                toast({
                  title: "训练开始",
                  description: `第${ninetyDayCurrentDay}天训练已开始，加油！`,
                });
              }}
              disabled={isTrainingActive}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">暂无训练内容</p>
              </CardContent>
            </Card>
          )}

          {/* Active Training Interface */}
          {isTrainingActive && activeTrainingType === '90day' && (
            <Card className="border-primary">
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
                          setActiveTrainingType(null);
                          setActive90DayNumber(null);
                          setActiveElapsedTime(0);
                          setTrainingNotes("");
                          toast({
                            title: "训练已取消",
                            description: "你可以随时重新开始训练"
                          });
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        取消训练
                      </Button>
                      <Button
                        onClick={() => {
                          if (active90DayNumber && activeElapsedTime > 0) {
                            setShowRatingModal(true);
                          } else {
                            toast({
                              title: "训练时间过短",
                              description: "请至少训练1分钟再提交",
                              variant: "destructive"
                            });
                          }
                        }}
                        className="flex-1"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        完成训练
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specialized Training Section - Independent Display */}
          <div className="space-y-4 pt-6 border-t border-green-300">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-green-800">专项训练</h3>
              <Badge variant="outline" className="ml-auto">
                {specializedTrainings.length} 个训练项目
              </Badge>
            </div>

            {specializedLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-4">加载专项训练...</p>
              </div>
            ) : specializedTrainings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specializedTrainings.map((training) => (
                  <SpecializedTrainingCard
                    key={training.id}
                    training={training}
                    onStartTraining={() => {
                      // TODO: Implement specialized training start logic
                      toast({
                        title: "专项训练",
                        description: `即将开始 ${training.name} 训练`,
                      });
                    }}
                    disabled={isTrainingActive}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-muted-foreground">暂无专项训练项目</p>
                  <p className="text-sm text-muted-foreground mt-1">更多训练内容正在准备中</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Training Records Section */}
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-gray-600" />
              <div>
                <CardTitle className="text-lg text-gray-800">练球日志</CardTitle>
                <p className="text-sm text-gray-600 mt-1">查看最近的训练记录</p>
              </div>
            </div>
            <Badge className="bg-gray-100 text-gray-800 text-xs">
              {recordsArray.length} 条记录
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recordsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
            </div>
          ) : recordsArray.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recordsArray.slice(0, 10).map((record: any) => (
                <div key={record.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-white rounded-r-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{record.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(record.duration / 60)}分{record.duration % 60}秒
                        </span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {record.rating}/5
                        </span>
                      </div>
                      {record.notes && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-1">训练心得：</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{record.notes}</p>
                        </div>
                      )}
                      {record.aiFeedback && (
                        <div className="mt-2">
                          <p className="text-xs text-blue-600 mb-1">AI 教练反馈：</p>
                          <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded border-l-2 border-blue-200">{record.aiFeedback}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {record.completedAt ? 
                        new Date(record.completedAt).toLocaleDateString('zh-CN') : 
                        record.createdAt ? 
                        new Date(record.createdAt).toLocaleDateString('zh-CN') :
                        '今天'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">还没有训练记录</p>
              <p className="text-xs text-gray-400 mt-1">完成训练后记录会显示在这里</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Celebration Modal */}
      {showCelebration && celebrationData && (
        <TrainingCompleteModal
          sessionTitle={celebrationData.sessionTitle}
          earnedExp={celebrationData.earnedExp}
          stars={celebrationData.stars}
          duration={celebrationData.duration}
          onClose={() => {
            setShowCelebration(false);
            setCelebrationData(null);
          }}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          sessionType={currentSessionType}
          duration={activeElapsedTime}
          notes={trainingNotes}
          onSubmit={handleRatingSubmit}
          onCancel={() => setShowRatingModal(false)}
        />
      )}

      {/* AI Feedback Modal */}
      {showAiFeedbackModal && aiFeedback && (
        <AiFeedbackModal
          feedback={aiFeedback}
          rating={currentRating}
          onClose={() => {
            setShowAiFeedbackModal(false);
            // Show achievement modal after AI feedback if there are unlocked achievements
            if (unlockedAchievements.length > 0) {
              setTimeout(() => {
                setShowAchievementModal(true);
              }, 500); // Small delay for smooth transition
            }
          }}
        />
      )}

      {/* Achievement Unlock Modal */}
      {showAchievementModal && unlockedAchievements.length > 0 && (
        <AchievementUnlockModal
          achievements={unlockedAchievements}
          onClose={() => {
            setShowAchievementModal(false);
            setUnlockedAchievements([]); // Clear unlocked achievements
          }}
        />
      )}
    </div>
  );
}