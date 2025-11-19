import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Target, Zap, GitBranch, Flame, Brain, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useLocation } from 'wouter';
import type { ScoreChanges, AbilityScores } from '@/hooks/useNinetyDayTraining';

/**
 * Score Feedback Modal Component
 *
 * Animated modal showing ability score changes after training
 *
 * Features:
 * - Celebratory animations and confetti
 * - Individual score change displays
 * - New score values
 * - Encouraging messages
 * - Auto-dismiss option
 *
 * Props:
 * - open: Whether modal is visible
 * - onClose: Close handler
 * - scoreChanges: Score deltas from training
 * - newScores: Updated ability scores
 */

interface ScoreFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  scoreChanges: ScoreChanges | null;
  newScores: AbilityScores | null;
}

interface ScoreChangeItem {
  key: string;
  label: string;
  icon: React.ElementType;
  change: number;
  newValue: number;
  color: string;
}

export default function ScoreFeedbackModal({
  open,
  onClose,
  scoreChanges,
  newScores,
}: ScoreFeedbackModalProps) {
  const { width, height } = useWindowSize();
  const [, navigate] = useLocation();

  if (!scoreChanges || !newScores) {
    return null;
  }

  // Map score changes to display items
  const scoreItems: ScoreChangeItem[] = [
    {
      key: 'accuracy',
      label: '准度分',
      icon: Target,
      change: scoreChanges.accuracy || 0,
      newValue: newScores.accuracy_score,
      color: 'text-blue-600',
    },
    {
      key: 'spin',
      label: '杆法分',
      icon: Zap,
      change: scoreChanges.spin || 0,
      newValue: newScores.spin_score,
      color: 'text-purple-600',
    },
    {
      key: 'positioning',
      label: '走位分',
      icon: GitBranch,
      change: scoreChanges.positioning || 0,
      newValue: newScores.positioning_score,
      color: 'text-green-600',
    },
    {
      key: 'power',
      label: '发力分',
      icon: Flame,
      change: scoreChanges.power || 0,
      newValue: newScores.power_score,
      color: 'text-orange-600',
    },
    {
      key: 'strategy',
      label: '策略分',
      icon: Brain,
      change: scoreChanges.strategy || 0,
      newValue: newScores.strategy_score,
      color: 'text-indigo-600',
    },
  ].filter((item) => item.change !== 0); // Only show scores that changed

  const clearanceChange = scoreChanges.clearance || 0;
  const hasClearanceChange = clearanceChange !== 0;

  // Get encouraging message based on score changes
  const getMessage = () => {
    const totalChange = Object.values(scoreChanges).reduce((sum, val) => sum + (val || 0), 0);

    if (totalChange >= 20) return '🏆 太棒了！你的进步非常显著！';
    if (totalChange >= 10) return '💪 很好！继续保持这样的训练强度！';
    if (totalChange >= 5) return '👍 不错！稳步提升中！';
    if (totalChange > 0) return '✨ 每一次训练都在积累进步！';
    return '📊 训练数据已记录！';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Confetti effect */}
      {open && clearanceChange > 0 && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={clearanceChange >= 5 ? 200 : 100}
          gravity={0.3}
        />
      )}

      <DialogContent className="max-w-2xl">
        <div className="py-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">训练完成！</h2>
            <p className="text-lg text-muted-foreground">{getMessage()}</p>
          </motion.div>

          {/* Clearance Score Change */}
          {hasClearanceChange && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      清台能力总分
                    </p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {newScores.clearance_score}
                    </p>
                  </div>
                </div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    +{clearanceChange}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Individual Score Changes */}
          {scoreItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground text-center">
                能力分变化详情
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence>
                  {scoreItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.key}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${item.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.label}</p>
                            <p className="text-sm text-muted-foreground">
                              当前分数: {item.newValue}
                            </p>
                          </div>
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                            item.change > 0
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-bold">
                            {item.change > 0 ? '+' : ''}{item.change}
                          </span>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              onClick={onClose}
              size="lg"
              variant="outline"
              className="flex-1 font-semibold"
            >
              继续训练
            </Button>
            <Button
              onClick={() => navigate('/profile')}
              size="lg"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
            >
              <Target className="w-4 h-4 mr-2" />
              查看完整能力分析
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
