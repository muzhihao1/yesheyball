import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Target, Zap, GitBranch, Flame, Brain } from 'lucide-react';
import type { AbilityScores } from '@/hooks/useNinetyDayTraining';

/**
 * Ability Score Cards Component
 *
 * Displays 5 individual ability score cards with:
 * - Icon representing each skill
 * - Score value with color coding
 * - Progress bar
 * - Skill name in Chinese
 *
 * Features:
 * - Animated score changes
 * - Color-coded by proficiency level
 * - Responsive grid layout
 */

interface AbilityScoreCardsProps {
  scores: AbilityScores | null | undefined;
  isLoading?: boolean;
  className?: string;
}

interface ScoreCardData {
  key: keyof Omit<AbilityScores, 'clearance_score'>;
  label: string;
  icon: React.ElementType;
  color: string;
}

export default function AbilityScoreCards({ scores, isLoading, className }: AbilityScoreCardsProps) {
  const defaultScores: AbilityScores = {
    accuracy_score: 0,
    spin_score: 0,
    positioning_score: 0,
    power_score: 0,
    strategy_score: 0,
    clearance_score: 0,
  };

  const currentScores = scores || defaultScores;

  const scoreCards: ScoreCardData[] = [
    {
      key: 'accuracy_score',
      label: '准度分',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      key: 'spin_score',
      label: '杆法分',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
    },
    {
      key: 'positioning_score',
      label: '走位分',
      icon: GitBranch,
      color: 'from-green-500 to-emerald-500',
    },
    {
      key: 'power_score',
      label: '发力分',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
    },
    {
      key: 'strategy_score',
      label: '策略分',
      icon: Brain,
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  const getScoreLevel = (score: number): string => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '及格';
    return '需提升';
  };

  const getScoreLevelColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
      {scoreCards.map((card, index) => {
        const score = currentScores[card.key];
        const Icon = card.icon;
        const level = getScoreLevel(score);
        const levelColor = getScoreLevelColor(score);

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Gradient header */}
              <div className={`h-2 bg-gradient-to-r ${card.color}`} />

              <CardContent className="p-6">
                {/* Icon and label */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-10`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${levelColor}`}>{level}</span>
                </div>

                {/* Score */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      key={score}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-foreground"
                    >
                      {score}
                    </motion.span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${card.color} rounded-full`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
