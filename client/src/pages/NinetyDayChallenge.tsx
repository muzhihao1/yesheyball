import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, BookOpen, PlayCircle, Target } from 'lucide-react';
import AbilityRadarChart from '@/components/ninety-day/AbilityRadarChart';
import AbilityScoreCards from '@/components/ninety-day/AbilityScoreCards';
import ProgressCalendar, { type DayStatus } from '@/components/ninety-day/ProgressCalendar';
import StatsPanel from '@/components/ninety-day/StatsPanel';
import WelcomeModal from '@/components/ninety-day/WelcomeModal';
import TrainingModal from '@/components/ninety-day/TrainingModal';
import ScoreFeedbackModal from '@/components/ninety-day/ScoreFeedbackModal';
import {
  useAbilityScores,
  useNinetyDayChallengeProgress,
  useDayCurriculum,
  useTrainingSubmission,
  type TrainingSubmissionPayload,
  type TrainingSubmissionResponse,
} from '@/hooks/useNinetyDayTraining';

/**
 * Ninety Day Challenge Page
 *
 * Main page for the 90-day billiards training challenge with ability scoring system
 *
 * Features:
 * - Ability score dashboard (radar chart + cards)
 * - Current day curriculum display
 * - 90-day progress calendar
 * - Training statistics panel
 * - Training modal for session submission
 *
 * Layout:
 * - Top: Ability scores visualization
 * - Middle: Current day card + action buttons
 * - Bottom: Progress calendar + stats panel
 */

export default function NinetyDayChallenge() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Modal state management
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<TrainingSubmissionResponse | null>(null);
  const [isStartingChallenge, setIsStartingChallenge] = useState(false);

  // Fetch user data
  const { data: abilityScores, isLoading: scoresLoading } = useAbilityScores(user?.id || '');
  const { data: challengeProgress, isLoading: progressLoading, refetch: refetchProgress } = useNinetyDayChallengeProgress(
    user?.id || ''
  );

  // Fetch current day curriculum
  const currentDay = challengeProgress?.challenge_current_day || 1;
  const { data: currentCurriculum, isLoading: curriculumLoading } = useDayCurriculum(currentDay);

  // Training submission mutation
  const trainingSubmission = useTrainingSubmission();

  const isLoading = scoresLoading || progressLoading || curriculumLoading;

  // Check if user is first-time (no challenge start date)
  useEffect(() => {
    if (!isLoading && challengeProgress && !challengeProgress.challenge_start_date) {
      setShowWelcomeModal(true);
    }
  }, [isLoading, challengeProgress]);

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
        throw new Error('Failed to start challenge');
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
   * Handle day click in calendar
   * TODO: Show day details modal for reviewing past days
   */
  const handleDayClick = (dayNumber: number) => {
    setSelectedDay(dayNumber);
    // Future: Show day details modal with training history
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
   * Refreshes all data after training completion
   */
  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    setLastSubmissionResult(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              90天台球挑战
            </h1>
            <p className="text-muted-foreground mt-2">
              系统化训练 · 能力提升 · 成为更强的球手
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              第 {currentDay} 天
            </span>
          </div>
        </div>

        {/* Ability Scores Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            能力分析
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart */}
            <div className="lg:col-span-1">
              <AbilityRadarChart scores={abilityScores} isLoading={scoresLoading} />
            </div>

            {/* Score Cards */}
            <div className="lg:col-span-2">
              <AbilityScoreCards scores={abilityScores} isLoading={scoresLoading} />
            </div>
          </div>
        </section>

        {/* Current Day Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            今日训练
          </h2>

          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
                    {curriculum?.title || `第${currentDay}天训练`}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                      {curriculum?.trainingType || '系统训练'}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                      {curriculum?.difficulty || '中级'}
                    </span>
                    {curriculum?.estimatedDuration && (
                      <span className="text-muted-foreground">
                        预计时长: {curriculum.estimatedDuration} 分钟
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
                        <span className="text-blue-600 mt-1">•</span>
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
                        <span className="text-indigo-600 mt-1">✓</span>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 text-lg"
                >
                  <PlayCircle className="w-6 h-6 mr-2" />
                  开始今日训练
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Progress Calendar */}
        <section className="space-y-4">
          <ProgressCalendar days={dayStatuses} onDayClick={handleDayClick} />
        </section>

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

      {/* Score Feedback Modal - Show training results */}
      <ScoreFeedbackModal
        open={showFeedbackModal}
        onClose={handleFeedbackClose}
        scoreChanges={lastSubmissionResult?.score_changes || null}
        newScores={lastSubmissionResult?.new_scores || null}
      />
    </div>
  );
}
