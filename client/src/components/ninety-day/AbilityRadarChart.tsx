import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { AbilityScores } from '@/hooks/useAbilityScores';

/**
 * Ability Radar Chart Component
 *
 * Displays a 5-dimensional radar chart showing user's ability scores:
 * - 准度分 (Accuracy)
 * - 杆法分 (Spin Control)
 * - 走位分 (Positioning)
 * - 发力分 (Power)
 * - 策略分 (Strategy)
 *
 * Features:
 * - Animated transitions when scores change
 * - Responsive design
 * - Tooltips for detailed values
 * - Color-coded by skill level
 */

interface AbilityRadarChartProps {
  scores: AbilityScores | null | undefined;
  isLoading?: boolean;
  className?: string;
}

export default function AbilityRadarChart({ scores, isLoading, className }: AbilityRadarChartProps) {
  // Default scores if none provided
  const defaultScores: AbilityScores = {
    accuracy: 0,
    spin: 0,
    positioning: 0,
    power: 0,
    strategy: 0,
    clearance: 0,
  };

  const currentScores = scores || defaultScores;

  // Transform scores for radar chart
  const data = [
    {
      subject: '准度',
      value: currentScores.accuracy,
      fullMark: 100,
    },
    {
      subject: '杆法',
      value: currentScores.spin,
      fullMark: 100,
    },
    {
      subject: '走位',
      value: currentScores.positioning,
      fullMark: 100,
    },
    {
      subject: '发力',
      value: currentScores.power,
      fullMark: 100,
    },
    {
      subject: '策略',
      value: currentScores.strategy,
      fullMark: 100,
    },
  ];

  // Get color based on average score
  const avgScore = (
    currentScores.accuracy +
    currentScores.spin +
    currentScores.positioning +
    currentScores.power +
    currentScores.strategy
  ) / 5;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green - 优秀
    if (score >= 60) return '#3b82f6'; // Blue - 良好
    if (score >= 40) return '#f59e0b'; // Orange - 及格
    return '#ef4444'; // Red - 需要努力
  };

  /**
   * Get color for clearance score (0-500 scale)
   */
  const getClearanceScoreColor = (score: number) => {
    if (score >= 400) return '#10b981'; // Green - 80% of 500
    if (score >= 300) return '#3b82f6'; // Blue - 60% of 500
    if (score >= 200) return '#f59e0b'; // Orange - 40% of 500
    return '#ef4444'; // Red - below 40%
  };

  const scoreColor = getScoreColor(avgScore);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{payload[0].payload.subject}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            分数: <span className="font-bold" style={{ color: scoreColor }}>{payload[0].value}</span> / 100
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-center">能力分析</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">能力分析</CardTitle>
        <div className="text-center text-sm text-muted-foreground mt-2">
          清台能力总分：
          <motion.span
            key={currentScores.clearance}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-bold text-2xl ml-2"
            style={{ color: getClearanceScoreColor(currentScores.clearance) }}
          >
            {currentScores.clearance}
          </motion.span>
          <span className="text-muted-foreground"> / 500</span>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'currentColor', fontSize: 14 }}
              className="text-foreground"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="能力分"
              dataKey="value"
              stroke={scoreColor}
              fill={scoreColor}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>0-39 需要努力</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>40-59 及格</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>60-79 良好</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>80-100 优秀</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
