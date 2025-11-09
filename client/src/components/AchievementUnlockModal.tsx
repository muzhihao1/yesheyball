/**
 * Achievement Unlock Modal Component
 *
 * Celebration modal displayed when user unlocks new achievements
 *
 * Features:
 * - Fireworks and confetti animation
 * - Achievement icon with scale animation
 * - Experience reward display
 * - Support for multiple achievements in sequence
 * - Auto-dismiss after viewing
 *
 * Usage:
 * ```tsx
 * {unlockedAchievements.length > 0 && (
 *   <AchievementUnlockModal
 *     achievements={unlockedAchievements}
 *     onClose={() => setUnlockedAchievements([])}
 *   />
 * )}
 * ```
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Button } from '@/components/ui/button';
import { Trophy, Star, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  expReward: number;
  category: string;
}

interface UserAchievement {
  achievement: Achievement;
  unlockedAt?: string;
}

interface AchievementUnlockModalProps {
  achievements: UserAchievement[];
  onClose: () => void;
}

export function AchievementUnlockModal({
  achievements,
  onClose,
}: AchievementUnlockModalProps) {
  const { width, height } = useWindowSize();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  const currentAchievement = achievements[currentIndex]?.achievement;
  const hasMultiple = achievements.length > 1;
  const isLast = currentIndex === achievements.length - 1;

  useEffect(() => {
    // Auto-hide confetti after 4 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowConfetti(true); // Reset confetti for next achievement
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowConfetti(true);
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'master':
        return 'from-purple-500 to-pink-600';
      case 'advanced':
        return 'from-orange-500 to-red-600';
      case 'intermediate':
        return 'from-blue-500 to-indigo-600';
      case 'beginner':
      default:
        return 'from-green-500 to-emerald-600';
    }
  };

  const getCategoryBadge = (category: string): string => {
    switch (category) {
      case 'master':
        return '大师级';
      case 'advanced':
        return '高级';
      case 'intermediate':
        return '中级';
      case 'beginner':
      default:
        return '初级';
    }
  };

  if (!currentAchievement) {
    return null;
  }

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.4}
          colors={['#ffd700', '#ffed4e', '#ffb347', '#ff6347', '#ff1493', '#9370db']}
        />
      )}

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <motion.div
        className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.4 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 成就解锁！</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
        </motion.div>

        {/* Achievement icon with pulse animation */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-full flex items-center justify-center border-4 border-yellow-300 shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <span className="text-6xl">{currentAchievement.icon}</span>
          </motion.div>
        </motion.div>

        {/* Achievement name and description */}
        <motion.div
          className="text-center mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {currentAchievement.name}
          </h3>
          <p className="text-gray-600">
            {currentAchievement.description}
          </p>
        </motion.div>

        {/* Experience reward */}
        <motion.div
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <div className="text-sm text-gray-600 text-center mb-1">获得经验值</div>
          <motion.div
            className="text-4xl font-bold text-green-600 text-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
          >
            +{currentAchievement.expReward}
          </motion.div>
        </motion.div>

        {/* Achievement category badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${currentAchievement.category === 'beginner' ? 'bg-blue-100 text-blue-800' : ''}
            ${currentAchievement.category === 'intermediate' ? 'bg-purple-100 text-purple-800' : ''}
            ${currentAchievement.category === 'advanced' ? 'bg-orange-100 text-orange-800' : ''}
            ${currentAchievement.category === 'master' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {currentAchievement.category === 'beginner' && '新手'}
            {currentAchievement.category === 'intermediate' && '进阶'}
            {currentAchievement.category === 'advanced' && '高级'}
            {currentAchievement.category === 'master' && '大师'}
          </span>
        </motion.div>

        {/* Navigation and confirm buttons */}
        {hasMultiple && (
          <motion.div
            className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>解锁了 {achievements.length} 个成就 · {currentIndex + 1}/{achievements.length}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-2"
        >
          {hasMultiple && currentIndex > 0 && (
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一个
            </Button>
          )}

          <Button
            onClick={handleNext}
            className={`${hasMultiple && currentIndex > 0 ? 'flex-1' : 'w-full'} bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3`}
          >
            {isLast ? '太棒了！继续努力' : (
              <>
                下一个
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
    </>
  );
}
