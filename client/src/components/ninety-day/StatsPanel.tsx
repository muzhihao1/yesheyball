import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle2, Clock, TrendingUp, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Stats Panel Component
 *
 * Displays training statistics and progress metrics
 *
 * Metrics shown:
 * - Days completed
 * - Current day
 * - Total training time
 * - Consecutive days streak
 * - Success rate
 * - Days since start
 *
 * Features:
 * - Animated stat cards
 * - Color-coded indicators
 * - Progress visualization
 */

interface StatsPanelProps {
  stats: {
    completedDays: number;
    currentDay: number;
    totalTime: number; // in minutes
    successfulDays: number;
    daysSinceStart: number | null;
  };
  isLoading?: boolean;
  className?: string;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  delay: number;
}

function StatCard({ icon: Icon, label, value, subtitle, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
              <motion.p
                key={value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-foreground"
              >
                {value}
              </motion.p>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
              <Icon className="w-6 h-6" style={{ color: color.replace('bg-', '').replace('-500', '') }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function StatsPanel({ stats, isLoading, className }: StatsPanelProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { completedDays, currentDay, totalTime, successfulDays, daysSinceStart } = stats;

  // Calculate success rate
  const successRate = completedDays > 0 ? Math.round((successfulDays / completedDays) * 100) : 0;

  // Format total time
  const totalHours = Math.floor(totalTime / 60);
  const totalMinutes = totalTime % 60;
  const timeDisplay = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`;

  // Calculate average time per day
  const avgTimePerDay = completedDays > 0 ? Math.round(totalTime / completedDays) : 0;

  const statCards = [
    {
      icon: CheckCircle2,
      label: '已完成天数',
      value: completedDays,
      subtitle: `共90天，还剩 ${90 - completedDays} 天`,
      color: 'bg-green-500',
    },
    {
      icon: Calendar,
      label: '当前训练日',
      value: `第${currentDay}天`,
      subtitle: currentDay <= 90 ? '继续加油' : '挑战完成',
      color: 'bg-blue-500',
    },
    {
      icon: Clock,
      label: '累计训练时长',
      value: timeDisplay,
      subtitle: `平均每天 ${avgTimePerDay} 分钟`,
      color: 'bg-purple-500',
    },
    {
      icon: Trophy,
      label: '达标天数',
      value: successfulDays,
      subtitle: `成功率 ${successRate}%`,
      color: 'bg-amber-500',
    },
    {
      icon: TrendingUp,
      label: '进度',
      value: `${Math.round((completedDays / 90) * 100)}%`,
      subtitle: '距离完成',
      color: 'bg-teal-500',
    },
    {
      icon: Zap,
      label: '挑战天数',
      value: daysSinceStart !== null ? `${daysSinceStart}天` : '-',
      subtitle: '从开始挑战至今',
      color: 'bg-rose-500',
    },
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            训练统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((card, index) => (
              <StatCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                value={card.value}
                subtitle={card.subtitle}
                color={card.color}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Motivational message */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <p className="text-sm text-center text-blue-900 dark:text-blue-100 font-medium">
              {completedDays === 0 && '🚀 开始你的90天挑战吧！每一天的坚持都会带来进步。'}
              {completedDays > 0 && completedDays < 30 && '💪 很棒的开始！继续保持训练的节奏。'}
              {completedDays >= 30 && completedDays < 60 && '🔥 已经完成三分之一！你的努力正在累积成果。'}
              {completedDays >= 60 && completedDays < 90 && '🏆 进入冲刺阶段！胜利就在眼前。'}
              {completedDays >= 90 && '🎉 恭喜完成90天挑战！你已经成为更强大的球手。'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
