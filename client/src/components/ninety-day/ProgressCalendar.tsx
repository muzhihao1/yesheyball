import { memo } from 'react';
import { Check, Lock, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Progress Calendar Component
 *
 * Displays a 90-day grid calendar showing training progress
 *
 * Day states:
 * - Completed: Green checkmark
 * - Current: Blue highlight with play icon
 * - Locked: Gray with lock icon (future days)
 * - Available: White/ready for training
 *
 * Features:
 * - Responsive grid layout
 * - Click to view day details
 * - Visual progress indication
 * - Performance optimized with memo
 */

export interface DayStatus {
  dayNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}

interface ProgressCalendarProps {
  days: DayStatus[];
  onDayClick?: (dayNumber: number) => void;
  className?: string;
}

// Memoized day cell for performance
const DayCell = memo(({ day, onClick }: { day: DayStatus; onClick?: (day: number) => void }) => {
  const { dayNumber, isCompleted, isCurrent, isLocked } = day;

  const getCellStyle = () => {
    if (isCompleted) {
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        border: 'border-green-500',
        text: 'text-green-700 dark:text-green-300',
        hover: 'hover:bg-green-200 dark:hover:bg-green-900/50',
      };
    }

    if (isCurrent) {
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-500 border-2',
        text: 'text-blue-700 dark:text-blue-300 font-bold',
        hover: 'hover:bg-blue-200 dark:hover:bg-blue-900/50',
      };
    }

    if (isLocked) {
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-300 dark:border-gray-700',
        text: 'text-gray-400 dark:text-gray-600',
        hover: 'cursor-not-allowed',
      };
    }

    return {
      bg: 'bg-white dark:bg-gray-900',
      border: 'border-gray-300 dark:border-gray-700',
      text: 'text-gray-700 dark:text-gray-300',
      hover: 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
    };
  };

  const style = getCellStyle();

  const handleClick = () => {
    if (!isLocked && onClick) {
      onClick(dayNumber);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: dayNumber * 0.005 }}
      onClick={handleClick}
      className={cn(
        'relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all',
        style.bg,
        style.border,
        style.text,
        style.hover,
        'aspect-square'
      )}
    >
      {/* Day number */}
      <span className="text-sm font-semibold mb-1">{dayNumber}</span>

      {/* Status icon */}
      <div className="flex items-center justify-center">
        {isCompleted && <Check className="w-5 h-5 text-green-600 dark:text-green-400" />}
        {isCurrent && <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
      </div>

      {/* Current day indicator */}
      {isCurrent && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"
        />
      )}
    </motion.div>
  );
});

DayCell.displayName = 'DayCell';

export default function ProgressCalendar({ days, onDayClick, className }: ProgressCalendarProps) {
  const completedCount = days.filter((d) => d.isCompleted).length;
  const progressPercentage = Math.round((completedCount / 90) * 100);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">90天挑战进度</h3>
          <p className="text-sm text-muted-foreground mt-1">
            已完成 <span className="font-bold text-green-600 dark:text-green-400">{completedCount}</span> / 90 天
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>进度</span>
            <span className="font-bold">{progressPercentage}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-10 gap-2 sm:gap-3">
        {days.map((day) => (
          <DayCell key={day.dayNumber} day={day} onClick={onDayClick} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border-2 border-blue-500 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Play className="w-4 h-4 text-blue-600" />
          </div>
          <span>当前</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-green-500 bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span>已完成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-gray-300 bg-white dark:bg-gray-900"></div>
          <span>可训练</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-gray-300 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Lock className="w-3 h-3 text-gray-400" />
          </div>
          <span>未解锁</span>
        </div>
      </div>
    </div>
  );
}
