import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Target, TrendingUp, Award, Flame } from 'lucide-react';

/**
 * Progress Overview Modal Props
 */
export interface ProgressOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  completedDays: number;
  totalDuration: number; // Total training duration in minutes
  avgDuration: number; // Average duration per day
  qualifiedDays: number; // Days that met success criteria
  currentStreak: number;
  longestStreak: number;
}

/**
 * Progress Overview Modal
 *
 * Displays comprehensive 90-day challenge statistics in a modal
 * Replaces the confusing "full map view" with meaningful data visualization
 *
 * Features:
 * - Overall progress percentage and bar
 * - Training statistics (completed days, duration, qualified days)
 * - Streak information
 * - Visual progress indicators
 */
export default function ProgressOverviewModal({
  isOpen,
  onClose,
  currentDay,
  completedDays,
  totalDuration,
  avgDuration,
  qualifiedDays,
  currentStreak,
  longestStreak,
}: ProgressOverviewModalProps) {
  const progressPercentage = (currentDay / 90) * 100;
  const completionRate = completedDays > 0 ? (qualifiedDays / completedDays) * 100 : 0;

  const statCards = [
    {
      icon: Calendar,
      label: '已完成天数',
      value: completedDays,
      total: 90,
      unit: '天',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      icon: Target,
      label: '当前训练日',
      value: currentDay,
      total: 90,
      unit: '天',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Clock,
      label: '累计训练时长',
      value: totalDuration,
      unit: '分钟',
      subtext: `平均每天 ${Math.round(avgDuration)} 分钟`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon: Award,
      label: '达标天数',
      value: qualifiedDays,
      unit: '天',
      subtext: `成功率 ${completionRate.toFixed(1)}%`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Flame,
      label: '当前连续',
      value: currentStreak,
      unit: '天',
      subtext: `最长 ${longestStreak} 天`,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: TrendingUp,
      label: '整体进度',
      value: progressPercentage.toFixed(1),
      unit: '%',
      subtext: `还剩 ${90 - currentDay} 天`,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-600" />
            90天挑战进度总览
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Overall Progress Bar */}
          <div className="space-y-3 p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  第 {currentDay} 天
                </span>
                <span className="text-sm text-muted-foreground">/ 共 90 天</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {progressPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">完成进度</div>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {currentDay < 90
                ? `🚀 继续加油！还剩 ${90 - currentDay} 天就能完成挑战`
                : '🎉 恭喜完成90天挑战！'}
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`${stat.bgColor} p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                    <span className="text-sm text-muted-foreground">{stat.unit}</span>
                    {stat.total && (
                      <span className="text-sm text-muted-foreground ml-1">
                        / {stat.total}
                      </span>
                    )}
                  </div>
                  {stat.subtext && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Encouragement Message */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-center text-sm text-gray-700 dark:text-gray-300">
              {currentDay <= 30 && '💪 坚持训练，建立良好习惯！前30天是基础阶段。'}
              {currentDay > 30 && currentDay <= 60 && '🎯 进入强化阶段！技术能力正在快速提升。'}
              {currentDay > 60 && currentDay < 90 && '🔥 冲刺阶段！坚持到底就是胜利！'}
              {currentDay >= 90 && '🏆 完成挑战！你已经掌握了系统化训练的方法。'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
