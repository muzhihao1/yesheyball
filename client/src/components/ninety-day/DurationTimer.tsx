import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

/**
 * Duration Timer Component
 *
 * Stopwatch-style timer for tracking training duration
 *
 * Features:
 * - Start/pause/stop controls
 * - Minutes:seconds display
 * - Auto-increment every second
 * - Returns final duration in minutes
 */

interface DurationTimerProps {
  onDurationChange: (minutes: number) => void;
  className?: string;
}

export default function DurationTimer({ onDurationChange, className }: DurationTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          // Update parent with minutes (with decimal precision for validation)
          // Use 2 decimal places to allow proper validation (0.1 min = 6 seconds)
          onDurationChange(Math.round((newSeconds / 60) * 100) / 100);
          return newSeconds;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, onDurationChange]);

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    onDurationChange(0);
  };

  return (
    <div className={`flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg ${className}`}>
      {/* Timer display */}
      <div className="flex items-center gap-3">
        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <motion.div
          key={seconds}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-5xl font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums"
        >
          {formatTime(seconds)}
        </motion.div>
      </div>

      {/* Duration in minutes */}
      <p className="text-sm text-muted-foreground">
        训练时长：<span className="font-semibold">{Math.round(seconds / 60)}</span> 分钟
      </p>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <Button
            onClick={handleStart}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            {seconds === 0 ? '开始' : '继续'}
          </Button>
        ) : (
          <Button onClick={handlePause} className="bg-yellow-600 hover:bg-yellow-700 text-white">
            <Pause className="w-4 h-4 mr-2" />
            暂停
          </Button>
        )}

        <Button
          onClick={handleReset}
          variant="outline"
          disabled={seconds === 0}
          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Square className="w-4 h-4 mr-2" />
          重置
        </Button>
      </div>

      {/* Hint */}
      {seconds === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          点击"开始"按钮开始计时
        </p>
      )}
    </div>
  );
}
