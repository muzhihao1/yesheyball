/**
 * Level Assessment Component - 水平测试组件
 *
 * This component provides a 3-step onboarding flow for new users:
 * 1. Welcome page with pain points and value propositions
 * 2. Assessment questionnaire with 4 questions (0-2 points each)
 * 3. Results page with recommended starting day and 3-day preview
 *
 * The component uses framer-motion for smooth page transitions and
 * integrates with the backend API to save assessment results.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Stars,
  Clock,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useDayCurriculum } from "@/hooks/useNinetyDayTraining";

/**
 * Assessment questions configuration
 * Each question has a weight multiplier for final score calculation
 */
const QUESTIONS = [
  {
    id: 1,
    question: "您能稳定击打并进袋吗？",
    weight: 1.5,
    options: [
      { label: "几乎不能", score: 0, hint: "需要从基础瞄准和出杆开始" },
      { label: "偶尔可以", score: 1, hint: "有感觉但不稳定" },
      { label: "多数能进", score: 2, hint: "掌握基本瞄准方法" }
    ]
  },
  {
    id: 2,
    question: "您能控制母球停留位置吗？",
    weight: 1.0,
    options: [
      { label: "完全不会", score: 0, hint: "需要学习走位基础" },
      { label: "有时能控制", score: 1, hint: "理解走位概念" },
      { label: "基本能控制", score: 2, hint: "掌握基本走位技巧" }
    ]
  },
  {
    id: 3,
    question: "您掌握哪些杆法？",
    weight: 1.2,
    options: [
      { label: "只会中杆", score: 0, hint: "从基本杆法开始" },
      { label: "会高低杆", score: 1, hint: "有一定杆法基础" },
      { label: "会多种杆法", score: 2, hint: "杆法运用较熟练" }
    ]
  },
  {
    id: 4,
    question: "您的连续进球能力如何？",
    weight: 1.3,
    options: [
      { label: "1-2个球", score: 0, hint: "需要提升连续性" },
      { label: "3-5个球", score: 1, hint: "有一定连续能力" },
      { label: "5个以上", score: 2, hint: "连续进球能力较强" }
    ]
  }
] as const;

/**
 * Calculate recommended starting day based on assessment answers
 *
 * @param answers - Map of question IDs to selected scores
 * @returns Recommended day number (1, 5, 10, or 15)
 */
function computeRecommendedStart(answers: Record<number, number>): number {
  const totalScore = QUESTIONS.reduce((sum, q) => {
    return sum + (answers[q.id] || 0) * q.weight;
  }, 0);

  if (totalScore <= 2) return 1;    // Complete beginner
  if (totalScore <= 4) return 5;    // Some foundation
  if (totalScore <= 6) return 10;   // Intermediate level
  return 15;                         // Experienced player
}

/**
 * Get ability level description based on total score
 *
 * @param totalScore - Weighted total score from assessment
 * @returns Human-readable description of user's level
 */
function getAbilityDescription(totalScore: number): string {
  if (totalScore <= 2) {
    return "您正处于台球入门阶段，建议从基础击球技巧开始系统学习";
  }
  if (totalScore <= 4) {
    return "您已经掌握基本击球技巧，可以从进阶训练开始";
  }
  if (totalScore <= 6) {
    return "您具备较好的台球基础，可以直接进入技巧提升阶段";
  }
  return "您已有丰富的台球经验，可以从高级技巧开始挑战";
}

/**
 * Preview cards for 3-day training plan
 * Fetches and displays curriculum for the recommended starting days
 */
function TrainingPreviewCards({ startDay }: { startDay: number }) {
  const days = [startDay, startDay + 1, startDay + 2].filter(d => d >= 1 && d <= 90);

  const { data: day1 } = useDayCurriculum(days[0]);
  const { data: day2 } = useDayCurriculum(days[1]);
  const { data: day3 } = useDayCurriculum(days[2]);

  const curricula = [day1?.curriculum, day2?.curriculum, day3?.curriculum].filter(Boolean);

  if (curricula.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p>加载训练课程...</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {days.map((day, index) => {
        const curriculum = [day1?.curriculum, day2?.curriculum, day3?.curriculum][index];
        if (!curriculum) return null;

        return (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">第 {day} 天</span>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                    {curriculum.estimatedDuration || 30}分钟
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="font-semibold text-foreground">
                  {curriculum.title || "今日训练"}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {curriculum.description || "系统化训练，循序渐进提升"}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>{curriculum.trainingType || "系统训练"}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Main Level Assessment Component
 * Manages the 3-step assessment flow and API integration
 */
export default function LevelAssessment() {
  const [, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState<"welcome" | "questions" | "result">("welcome");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  /**
   * 检查是否为重新测试模式
   * 从 URL 查询参数中提取 isRetest 标志
   * 例如: /onboarding?isRetest=true
   */
  const isRetest = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('isRetest') === 'true';
  }, []);

  // Calculate recommended start day and total score
  const totalScore = useMemo(() => {
    return QUESTIONS.reduce((sum, q) => {
      return sum + (answers[q.id] || 0) * q.weight;
    }, 0);
  }, [answers]);

  const recommendedStartDay = useMemo(() => {
    return computeRecommendedStart(answers);
  }, [answers]);

  const abilityDescription = useMemo(() => {
    return getAbilityDescription(totalScore);
  }, [totalScore]);

  // Check if all questions are answered
  const allQuestionsAnswered = QUESTIONS.every(q => answers[q.id] !== undefined);

  // Progress tracking
  const progressPercentage = useMemo(() => {
    if (currentPage === "welcome") return 0;
    if (currentPage === "questions") return 50;
    return 100;
  }, [currentPage]);

  const handleStartQuestions = () => {
    setCurrentPage("questions");
  };

  /**
   * Handle answer selection for a question
   */
  const handleSelectAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  /**
   * Navigate to results page with loading animation
   */
  const handleViewResults = () => {
    setShowLoading(true);
    // Show loading animation for 1 second as per requirements
    setTimeout(() => {
      setShowLoading(false);
      setCurrentPage("result");
    }, 1000);
  };

  /**
   * Submit assessment results to backend and navigate to challenge
   * Includes timeout protection and comprehensive error handling
   */
  const handleComplete = async () => {
    const TIMEOUT_MS = 15000; // 15 second timeout
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      setIsSubmitting(true);

      // Get current Supabase session for Authorization header
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if session exists
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      } else {
        console.warn("[LevelAssessment] No Supabase session found");
      }

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("API request timeout after 15 seconds"));
        }, TIMEOUT_MS);
      });

      // Create fetch promise
      const fetchPromise = fetch("/api/onboarding/complete", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          recommendedStartDay: recommendedStartDay,
          answers: answers,
          totalScore: totalScore,
          isRetest: isRetest, // 新增：标记是否为重新测试
        }),
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      // Clear timeout if fetch succeeded
      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[LevelAssessment] API returned status ${response.status}:`, errorBody);
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
      }

      await response.json();

      // Save to localStorage as backup
      localStorage.setItem("level_assessment_completed", "true");
      localStorage.setItem("onboarding_completed", "true");
      localStorage.setItem("recommended_start_day", String(recommendedStartDay));

      // Navigate to 90-day challenge
      navigate("/ninety-day-challenge");
    } catch (error) {
      // Clear timeout on error
      if (timeoutId) clearTimeout(timeoutId);

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[LevelAssessment] Error completing assessment:", errorMessage);
      console.error("[LevelAssessment] Full error object:", error);

      // Show user-friendly error message
      const userMessage = errorMessage.includes("timeout")
        ? "保存超时，请检查网络连接后重试"
        : errorMessage.includes("API Error")
        ? `保存失败: ${errorMessage}`
        : "保存过程中出错，请稍后重试";

      alert(userMessage);

    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header with progress bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-700 font-semibold">水平测试</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              三个月一杆清台
            </h1>
            <p className="text-muted-foreground mt-2">
              完成测试，获取专属训练计划
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="text-sm text-muted-foreground">进度</div>
            <Progress value={progressPercentage} className="w-40" />
          </div>
        </div>

        {/* Page content with animations */}
        {/*
          CRITICAL FIX: Changed mode from "wait" to undefined (default "sync")
          mode="wait" was causing the welcome page exit animation to block
          the questions page from rendering in production. This is a known
          issue with Framer Motion when animations take longer than expected.
          By removing mode="wait", AnimatePresence will mount the new component
          immediately while animating the old one out, preventing UI freezing.
        */}
        <AnimatePresence>
          {/* Welcome Page */}
          {currentPage === "welcome" && (
            <motion.div
              key="welcome"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="border-emerald-200 shadow-lg">
                <CardContent className="p-8 md:p-12 space-y-8">
                  {/* Brand Title */}
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-3 text-emerald-700">
                      <Sparkles className="w-6 h-6" />
                      <span className="text-xl font-bold">三个月一杆清台训练系统</span>
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      用 90 天，从新手到一杆清台
                    </p>
                    <p className="text-muted-foreground">
                      已有1000+新手完成清台
                    </p>
                  </div>

                  {/* Pain Points Section */}
                  <div className="space-y-4 bg-amber-50 p-6 rounded-lg border border-amber-200">
                    <p className="font-semibold text-amber-900 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      你是否曾经遇到这些困扰？
                    </p>
                    <ul className="space-y-3 text-sm text-amber-900">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">•</span>
                        <span>学了一段时间也不知道自己有没有进步？</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">•</span>
                        <span>不知道该练什么，只会乱打？</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">•</span>
                        <span>找不到系统课程或靠谱教练？</span>
                      </li>
                    </ul>
                  </div>

                  {/* Value Propositions */}
                  <div className="space-y-4 bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                    <p className="font-semibold text-emerald-900 flex items-center gap-2">
                      <Stars className="w-5 h-5" />
                      我们为你准备了完整的解决方案
                    </p>
                    <ul className="space-y-3 text-sm text-emerald-900">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>90 天系统化训练计划</strong>
                          <p className="text-emerald-700">从基础到进阶，循序渐进提升</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>个性化起步建议</strong>
                          <p className="text-emerald-700">根据你的水平，从最适合的地方开始</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>能力提升可视化</strong>
                          <p className="text-emerald-700">清台能力分数实时跟踪，见证每一次进步</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* CTA Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                      <Clock className="w-4 h-4" />
                      <span>只需 1 分钟，了解你的当前水平</span>
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        data-testid="start-level-test"
                        onClick={handleStartQuestions}
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                      >
                        开始水平测试
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Questions Page */}
          {currentPage === "questions" && (
            <motion.div
              key="questions"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
              data-testid="questions-container"
            >
              {/* Question Cards */}
              <div className="space-y-4">
                {QUESTIONS.map((question, qIndex) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qIndex * 0.1 }}
                  >
                    <Card className="border-emerald-100">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">
                              第 {qIndex + 1}/4 题
                            </p>
                            <CardTitle className="text-lg">{question.question}</CardTitle>
                          </div>
                          {answers[question.id] !== undefined && (
                            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="grid md:grid-cols-3 gap-3">
                        {question.options.map((option) => {
                          const isSelected = answers[question.id] === option.score;
                          return (
                            <button
                              key={option.label}
                              className={`text-left p-4 rounded-lg border transition-all ${
                                isSelected
                                  ? "border-emerald-500 bg-emerald-50 shadow-md"
                                  : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                              }`}
                              onClick={() => handleSelectAnswer(question.id, option.score)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{option.label}</span>
                                {isSelected && (
                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{option.hint}</p>
                            </button>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage("welcome")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
                <Button
                  onClick={handleViewResults}
                  disabled={!allQuestionsAnswered}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  查看测试结果
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {showLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-4" />
              <p className="text-lg font-semibold text-foreground">
                正在生成您的专属训练计划...
              </p>
            </motion.div>
          )}

          {/* Result Page */}
          {currentPage === "result" && !showLoading && (
            <motion.div
              key="result"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="border-emerald-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Stars className="w-6 h-6 text-amber-500" />
                    推荐从第 {recommendedStartDay} 天开始
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {abilityDescription}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Ability Assessment Summary */}
                  <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-emerald-900 mb-2">能力评估</h3>
                        <div className="space-y-2 text-sm text-emerald-800">
                          <div className="flex items-center justify-between">
                            <span>综合评分</span>
                            <span className="font-bold">{totalScore.toFixed(1)} 分</span>
                          </div>
                          <Progress
                            value={(totalScore / 12) * 100}
                            className="h-2"
                          />
                          <p className="text-xs text-emerald-700 mt-2">
                            已为您匹配最适合的起步计划
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3-Day Training Preview */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-600" />
                      前3天训练计划预览
                    </h3>
                    <TrainingPreviewCards startDay={recommendedStartDay} />
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>预计每天 30-40 分钟，时间紧可先完成核心环节</span>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentPage("questions")}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      返回修改
                    </Button>
                    <Button
                      onClick={handleComplete}
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          开始我的训练之旅
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
