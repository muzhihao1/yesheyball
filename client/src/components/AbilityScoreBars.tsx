import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { AbilityScores } from '@/hooks/useAbilityScoresForProfile';

/**
 * AbilityScoreBars Component
 *
 * Displays detailed ability scores as progress bars with visual indicators.
 * Each dimension shows:
 * - Icon and label
 * - Description
 * - Numerical score
 * - Quality label (优秀/良好/及格/需努力)
 * - Visual progress bar
 *
 * Features:
 * - Color-coded by score level
 * - Prominent clearance score display in header
 * - Loading state
 * - Responsive design
 */

interface AbilityScoreBarsProps {
  scores: AbilityScores | null | undefined;
  isLoading?: boolean;
}

const DIMENSIONS = [
  { key: 'accuracy_score', label: '准度分', icon: '🎯', description: '击球精准度' },
  { key: 'spin_score', label: '杆法分', icon: '🌀', description: '旋转控制能力' },
  { key: 'positioning_score', label: '走位分', icon: '🎱', description: '母球控制能力' },
  { key: 'power_score', label: '发力分', icon: '💪', description: '力量控制能力' },
  { key: 'strategy_score', label: '策略分', icon: '🧠', description: '战术思考能力' },
] as const;

export default function AbilityScoreBars({ scores, isLoading }: AbilityScoreBarsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const defaultScores: AbilityScores = {
    accuracy_score: 0,
    spin_score: 0,
    positioning_score: 0,
    power_score: 0,
    strategy_score: 0,
    clearance_score: 0,
  };

  const currentScores = scores || defaultScores;

  /**
   * Get color class based on score level
   * @param score - Score value (0-100)
   * @returns Tailwind CSS color class
   */
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  /**
   * Get text color class based on score level
   * @param score - Score value (0-100)
   * @returns Tailwind CSS text color class
   */
  const getScoreTextColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  /**
   * Get quality label based on score level
   * @param score - Score value (0-100)
   * @returns Quality label text
   */
  const getScoreLabel = (score: number): string => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '及格';
    return '需努力';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>能力详情</span>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">清台能力总分</div>
            <div className={`text-3xl font-bold ${getScoreTextColor(currentScores.clearance_score)}`}>
              {currentScores.clearance_score}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {DIMENSIONS.map((dim) => {
          const score = currentScores[dim.key as keyof AbilityScores];
          return (
            <div key={dim.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{dim.icon}</span>
                  <div>
                    <div className="font-semibold">{dim.label}</div>
                    <div className="text-xs text-muted-foreground">{dim.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{score}</div>
                  <div className={`text-xs font-medium ${getScoreTextColor(score)}`}>
                    {getScoreLabel(score)}
                  </div>
                </div>
              </div>
              <Progress value={score} className="h-3" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
