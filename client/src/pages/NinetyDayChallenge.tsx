import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, BookOpen, PlayCircle, Target, Maximize2, Minimize2 } from 'lucide-react';
import { AdventureMap } from '@/components/ninety-day/AdventureMap';
import { DayDetailModal } from '@/components/ninety-day/DayDetailModal';
import { TrainingSubmitModal } from '@/components/ninety-day/TrainingSubmitModal';
import ProgressCalendar, { type DayStatus } from '@/components/ninety-day/ProgressCalendar';
import StatsPanel from '@/components/ninety-day/StatsPanel';
import WelcomeModal from '@/components/ninety-day/WelcomeModal';
import TrainingModal from '@/components/ninety-day/TrainingModal';
import ScoreFeedbackModal from '@/components/ninety-day/ScoreFeedbackModal';
import { AiFeedbackModal } from '@/components/AiFeedbackModal';
import { useAbilityScores } from '@/hooks/useAbilityScores';
import {
  useNinetyDayChallengeProgress,
  useDayCurriculum,
  useTrainingSubmission,
  useNinetyDayRecords,
  type TrainingSubmissionPayload,
  type TrainingSubmissionResponse,
  type NinetyDayTrainingRecord,
} from '@/hooks/useNinetyDayTraining';

/**
 * Ninety Day Challenge Page
 *
 * Main page for the 90-day billiards training challenge
 *
 * Features:
 * - Current day curriculum display
 * - 90-day progress calendar
 * - Training statistics panel
 * - Training modal for session submission
 * - Clearance score display in header
 *
 * Layout:
 * - Top: Header with clearance score and current day
 * - Middle: Current day card + action buttons
 * - Bottom: Progress calendar + stats panel
 */

export default function NinetyDayChallenge() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Auto-scroll to map section on first load
  const mapSectionRef = useRef<HTMLElement>(null);
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);

  // Map view mode: 'segmented' shows 30 days at a time, 'full' shows all 90 days
  const [viewMode, setViewMode] = useState<'segmented' | 'full'>('segmented');

  // Modal state management
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showDayDetailModal, setShowDayDetailModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false); // Training record submission modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<TrainingSubmissionResponse | null>(null);
  const [isStartingChallenge, setIsStartingChallenge] = useState(false);

  // AI Feedback state
  const [showAiFeedbackModal, setShowAiFeedbackModal] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [lastTrainingNotes, setLastTrainingNotes] = useState<string>("");
  const [lastTrainingDuration, setLastTrainingDuration] = useState<number>(0);

  // Fetch user data (unified ability scores hook)
  const { data: abilityScores, isLoading: scoresLoading } = useAbilityScores();
  const { data: challengeProgress, isLoading: progressLoading, refetch: refetchProgress } = useNinetyDayChallengeProgress(
    user?.id || ''
  );

  // Fetch current day curriculum
  const currentDay = challengeProgress?.challenge_current_day || 1;
  const { data: currentCurriculum, isLoading: curriculumLoading } = useDayCurriculum(currentDay);

  // Fetch selected day curriculum (for detail modal)
  const { data: selectedCurriculum, isLoading: selectedCurriculumLoading } = useDayCurriculum(selectedDay || 0);

  // Fetch all training records (for displaying ratings on map nodes)
  const { data: trainingRecordsData } = useNinetyDayRecords();

  // Training submission mutation
  const trainingSubmission = useTrainingSubmission();

  const isLoading = scoresLoading || progressLoading || curriculumLoading;

  // Create dayNumber → training record mapping for map node ratings
  const trainingRecordsMap = new Map<number, NinetyDayTrainingRecord>();
  if (trainingRecordsData?.records) {
    trainingRecordsData.records.forEach(record => {
      trainingRecordsMap.set(record.dayNumber, record);
    });
  }

  // ✅ Now using real API data from /api/ninety-day/records
  // Star ratings are calculated from training records' successRate (0-100 → 1-5 stars)
  // The AdventureMap component will display stars for completed training days

  // Check if user is first-time (no challenge start date)
  useEffect(() => {
    if (!isLoading && challengeProgress && !challengeProgress.challenge_start_date) {
      setShowWelcomeModal(true);
    }
  }, [isLoading, challengeProgress]);

  // Auto-scroll to training map on first load
  useEffect(() => {
    if (!hasAutoScrolled && !isLoading && challengeProgress && currentDay > 0) {
      // Delay scroll to ensure DOM is fully rendered
      setTimeout(() => {
        mapSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        setHasAutoScrolled(true);
      }, 300);
    }
  }, [hasAutoScrolled, isLoading, challengeProgress, currentDay]);

  // Generate day statuses for calendar
  const generateDayStatuses = (): DayStatus[] => {
    const completedDays = challengeProgress?.challenge_completed_days || 0;
    const currentDayNum = challengeProgress?.challenge_current_day || 1;

    return Array.from({ length: 90 }, (_, i) => {
      const dayNumber = i + 1;
      return {
        dayNumber,
        isCompleted: dayNumber < currentDayNum || (dayNumber <= completedDays),
        isCurrent: dayNumber === currentDayNum,
        isLocked: dayNumber > currentDayNum,
      };
    });
  };

  /**
   * Handle start challenge for first-time users
   * Initializes challenge start date in database
   */
  const handleStartChallenge = async () => {
    if (!user?.id) return;

    setIsStartingChallenge(true);
    try {
      // Call API to initialize challenge (set challenge_start_date)
      const response = await fetch('/api/ninety-day/start-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_access_token')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // If challenge already started (400 error), silently handle it
        if (response.status === 400) {
          console.log('Challenge already started, refreshing data...');
          await refetchProgress();
          setShowWelcomeModal(false);
          setIsStartingChallenge(false);
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start challenge');
      }

      // Refresh progress data
      await refetchProgress();

      // Close welcome modal
      setShowWelcomeModal(false);
    } catch (error) {
      console.error('Error starting challenge:', error);
      alert('启动挑战失败，请重试');
    } finally {
      setIsStartingChallenge(false);
    }
  };

  /**
   * Handle day click in adventure map/calendar
   * Opens training submission modal for the selected day
   */
  const handleDayClick = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setShowSubmitModal(true);
  };

  /**
   * Handle viewing day curriculum details
   */
  const handleViewDayDetails = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    setShowDayDetailModal(true);
  };

  /**
   * Handle start training button click
   * Opens training modal for current day
   */
  const handleStartTraining = () => {
    setShowTrainingModal(true);
  };

  /**
   * Handle training form submission
   * Submits training data and shows feedback modal with score changes
   */
  const handleTrainingSubmit = async (payload: TrainingSubmissionPayload) => {
    try {
      const result = await trainingSubmission.mutateAsync(payload);

      // Store result for feedback modal
      setLastSubmissionResult(result);

      // Store training data for AI feedback
      setLastTrainingNotes(payload.notes || "");
      setLastTrainingDuration(payload.duration_minutes);

      // Close training modal
      setShowTrainingModal(false);

      // Show feedback modal with score changes
      setShowFeedbackModal(true);
    } catch (error) {
      console.error('Error submitting training:', error);
      alert('提交训练失败，请重试');
    }
  };

  /**
   * Handle feedback modal close
   * Generates AI feedback and shows AI feedback modal
   */
  const handleFeedbackClose = async () => {
    setShowFeedbackModal(false);

    // Generate AI feedback in background
    try {
      // Calculate rating from score changes (1-5 stars)
      const scoreChanges = lastSubmissionResult?.score_changes;
      const totalChange = scoreChanges
        ? Object.values(scoreChanges).reduce((sum, val) => sum + (val || 0), 0)
        : 0;

      // Map score change to rating: 0-5 → 1, 6-10 → 2, 11-15 → 3, 16-20 → 4, 21+ → 5
      const rating = Math.min(Math.max(Math.ceil(totalChange / 5), 1), 5);

      const response = await fetch("/api/coaching-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          duration: lastTrainingDuration,
          notes: lastTrainingNotes,
          rating: rating,
          sessionType: currentCurriculum?.curriculum?.title || "90天挑战训练",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiFeedback(data.feedback);
        setShowAiFeedbackModal(true);
      }
    } catch (error) {
      console.error("Failed to generate AI feedback:", error);
      // Continue even if AI feedback fails - don't block user
    }

    // Clean up
    setLastSubmissionResult(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl shadow-lg"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl shadow-md"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-200">需要登录</h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  请先登录以访问90天挑战系统
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const curriculum = currentCurriculum?.curriculum;
  const dayStatuses = generateDayStatuses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-600 to-amber-600">
              90天台球挑战
            </h1>
            <p className="text-muted-foreground mt-2">
              系统化训练 · 能力提升 · 成为更强的球手
            </p>
          </div>
          {/* Unified Challenge Progress Card */}
          <div className="px-6 py-4 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg border-2 border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">90天挑战进度</h3>
            </div>

            <div className="space-y-3">
              {/* Current Day Display */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  第 {currentDay} 天
                </span>
                <span className="text-sm text-muted-foreground">/ 共 90 天</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>完成进度</span>
                  <span className="font-medium">{((currentDay / 90) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                    style={{ width: `${(currentDay / 90) * 100}%` }}
                  />
                </div>
              </div>

              {/* Clearance Score */}
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <span className="text-sm text-muted-foreground">清台能力</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {abilityScores?.clearance || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 500</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Day Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            今日训练
          </h2>

          <Card className="border-2 border-emerald-200 dark:border-emerald-800 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 via-green-50 to-amber-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-amber-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-emerald-900 dark:text-emerald-100 font-bold">
                    {curriculum?.title || `第${currentDay}天训练`}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full font-medium shadow-sm">
                      {curriculum?.trainingType || '系统训练'}
                    </span>
                    <span className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full font-medium shadow-sm">
                      {curriculum?.difficulty || '中级'}
                    </span>
                    {curriculum?.estimatedDuration && (
                      <span className="text-muted-foreground font-medium">
                        ⏱ {curriculum.estimatedDuration} 分钟
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Description */}
              {curriculum?.description && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">训练说明</h4>
                  <p className="text-foreground">{curriculum.description}</p>
                </div>
              )}

              {/* Objectives */}
              {curriculum?.objectives && curriculum.objectives.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">训练目标</h4>
                  <ul className="space-y-2">
                    {curriculum.objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1 font-bold">•</span>
                        <span className="text-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Points */}
              {curriculum?.keyPoints && curriculum.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">关键要点</h4>
                  <ul className="space-y-2">
                    {curriculum.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-1 font-bold">✓</span>
                        <span className="text-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  onClick={handleStartTraining}
                  size="lg"
                  className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-amber-600 hover:from-emerald-700 hover:via-green-700 hover:to-amber-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  <PlayCircle className="w-6 h-6 mr-2" />
                  开始今日训练
                </Button>
              </div>

              {/* 能力分析链接与技能库提示 */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all duration-300"
                  onClick={() => window.location.href = '/profile'}
                >
                  <Target className="w-4 h-4 mr-2 text-emerald-600" />
                  查看完整能力分析
                </Button>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="text-center font-medium">✅ 完成今日任务后，你可以：</p>
                  <div className="text-xs space-y-1 bg-gradient-to-r from-emerald-50/50 to-amber-50/50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl p-3 shadow-sm">
                    <p>📚 <strong>技能库</strong> - 复习十大招理论，巩固知识</p>
                    <p>🎯 <strong>专项训练道场</strong> - 针对薄弱环节，反复强化</p>
                    <p>🎮 <strong>练习场</strong> - 做题测试，验证学习成果</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    <Link href="/tasks">
                      <Button variant="outline" size="sm" className="text-xs h-8 border-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-all duration-300">
                        📚 技能库
                      </Button>
                    </Link>
                    <Link href="/levels">
                      <Button variant="outline" size="sm" className="text-xs h-8 border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-all duration-300">
                        🎮 练习场
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Adventure Map (SVG Path Visualization) */}
        <section ref={mapSectionRef} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-600" />
              训练地图
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'segmented' ? 'full' : 'segmented')}
              className="flex items-center gap-2 border-emerald-200 hover:bg-emerald-50"
            >
              {viewMode === 'segmented' ? (
                <>
                  <Maximize2 className="w-4 h-4 text-emerald-600" />
                  查看完整地图
                </>
              ) : (
                <>
                  <Minimize2 className="w-4 h-4 text-emerald-600" />
                  返回分段视图
                </>
              )}
            </Button>
          </div>
          <AdventureMap
            totalDays={90} // Full 90-day challenge map
            currentDay={currentDay}
            completedDays={challengeProgress?.challenge_completed_days || 0}
            onDayClick={handleDayClick}
            viewMode={viewMode}
            daysPerSegment={30} // Show 30 days at a time
            trainingRecords={trainingRecordsMap} // Pass training records for star ratings
          />
        </section>

        {/* Legacy Progress Calendar (keep for comparison) */}
        {/* <section className="space-y-4">
          <ProgressCalendar days={dayStatuses} onDayClick={handleDayClick} />
        </section> */}

        {/* Stats Panel */}
        <section>
          <StatsPanel
            stats={{
              completedDays: challengeProgress?.challenge_completed_days || 0,
              currentDay: challengeProgress?.challenge_current_day || 1,
              totalTime: 0, // TODO: Get from backend
              successfulDays: challengeProgress?.successful_days || 0,
              daysSinceStart: challengeProgress?.days_since_start || null,
            }}
            isLoading={progressLoading}
          />
        </section>
      </div>

      {/* Welcome Modal - First-time user onboarding */}
      <WelcomeModal
        open={showWelcomeModal}
        onOpenChange={setShowWelcomeModal}
        onStart={handleStartChallenge}
        isStarting={isStartingChallenge}
      />

      {/* Training Modal - Submit training session */}
      <TrainingModal
        open={showTrainingModal}
        onClose={() => setShowTrainingModal(false)}
        onSubmit={handleTrainingSubmit}
        curriculum={currentCurriculum?.curriculum}
        isSubmitting={trainingSubmission.isPending}
      />

      {/* Day Detail Modal - Show curriculum details for selected day */}
      <DayDetailModal
        open={showDayDetailModal}
        onClose={() => {
          setShowDayDetailModal(false);
          setSelectedDay(null);
        }}
        dayNumber={selectedDay || 0}
        curriculum={selectedCurriculum?.curriculum || null}
        isLoading={selectedCurriculumLoading}
      />

      {/* Training Submit Modal - Submit training record for selected day */}
      <TrainingSubmitModal
        isOpen={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setSelectedDay(null);
        }}
        dayNumber={selectedDay || 0}
        onSubmitSuccess={() => {
          // The useSubmitTraining hook already invalidates queries in onSuccess
          // Map will automatically refresh with new star ratings
          console.log('Training record submitted successfully for day', selectedDay);
        }}
      />

      {/* Score Feedback Modal - Show training results */}
      <ScoreFeedbackModal
        open={showFeedbackModal}
        onClose={handleFeedbackClose}
        scoreChanges={lastSubmissionResult?.score_changes || null}
        newScores={lastSubmissionResult?.new_scores || null}
      />

      {/* AI Feedback Modal - Show personalized coaching feedback */}
      {showAiFeedbackModal && (
        <AiFeedbackModal
          onClose={() => {
            setShowAiFeedbackModal(false);
            setAiFeedback("");
          }}
          feedback={aiFeedback}
          rating={Math.min(
            Math.max(
              Math.ceil(
                (lastSubmissionResult?.score_changes
                  ? Object.values(lastSubmissionResult.score_changes).reduce((sum, val) => sum + (val || 0), 0)
                  : 0) / 5
              ),
              1
            ),
            5
          )}
        />
      )}
    </div>
  );
}
