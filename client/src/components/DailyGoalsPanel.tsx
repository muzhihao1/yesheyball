/**
 * Daily Goals Panel Component
 *
 * Displays user's daily goals with progress tracking
 *
 * Features:
 * - Shows 3 daily goals
 * - Real-time progress updates
 * - Completion checkmarks
 * - Experience rewards display
 *
 * Usage:
 * ```tsx
 * <DailyGoalsPanel />
 * ```
 */

import { useDailyGoals } from "@/hooks/useDailyGoals";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Circle } from "lucide-react";

export function DailyGoalsPanel() {
  const { data: goals = [], isLoading, error } = useDailyGoals();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">每日目标</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">每日目标</h2>
        </div>
        <p className="text-sm text-gray-500">暂时无法加载目标</p>
      </div>
    );
  }

  const completedCount = goals.filter((g) => g.isCompleted).length;
  const allCompleted = completedCount === goals.length && goals.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">每日目标</h2>
        </div>
        <span className="text-sm text-gray-600">
          {completedCount}/{goals.length}
        </span>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map((goal, index) => (
          <GoalItem key={goal.id} goal={goal} index={index} />
        ))}
      </div>

      {/* Completion Message */}
      {allCompleted && (
        <motion.div
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-green-700 font-medium text-center">
            🎉 今日目标已全部完成！明天继续加油！
          </p>
        </motion.div>
      )}
    </div>
  );
}

interface GoalItemProps {
  goal: {
    id: number;
    targetValue: number;
    currentValue: number;
    isCompleted: boolean;
    template: {
      description: string;
      difficulty: string;
      rewardXp: number;
    };
  };
  index: number;
}

function GoalItem({ goal, index }: GoalItemProps) {
  const progress = Math.min(
    (goal.currentValue / goal.targetValue) * 100,
    100
  );

  const difficultyColors = {
    EASY: "bg-green-100 text-green-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HARD: "bg-purple-100 text-purple-700",
  };

  const difficultyLabels = {
    EASY: "简单",
    MEDIUM: "中等",
    HARD: "困难",
  };

  return (
    <motion.div
      className={`p-4 rounded-lg border transition-all ${
        goal.isCompleted
          ? "bg-green-50 border-green-200"
          : "bg-gray-50 border-gray-200 hover:border-gray-300"
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start gap-3">
        {/* Completion Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {goal.isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Description */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-sm font-medium ${
                goal.isCompleted ? "text-green-900 line-through" : "text-gray-900"
              }`}
            >
              {goal.template.description}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                difficultyColors[
                  goal.template.difficulty as keyof typeof difficultyColors
                ]
              }`}
            >
              {
                difficultyLabels[
                  goal.template.difficulty as keyof typeof difficultyLabels
                ]
              }
            </span>
          </div>

          {/* Progress Bar */}
          {!goal.isCompleted && (
            <div className="mb-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {goal.currentValue} / {goal.targetValue}
                </span>
                <span className="text-gray-500">{Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {/* Reward */}
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span>奖励:</span>
            <span className="font-semibold text-blue-600">
              +{goal.template.rewardXp} EXP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
