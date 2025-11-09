/**
 * Achievement Unlock Modal Component
 *
 * Displays a celebration animation when a user unlocks a new achievement
 *
 * Features:
 * - Full-screen overlay with backdrop blur
 * - Spring animations using Framer Motion
 * - Pulsing achievement icon
 * - Experience reward display
 * - Close button and auto-close on confirm
 *
 * Usage:
 * ```tsx
 * {showUnlock && (
 *   <AchievementUnlockModal
 *     achievement={unlockedAchievement}
 *     onClose={() => setShowUnlock(false)}
 *   />
 * )}
 * ```
 */

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Achievement } from '@/lib/types';

interface AchievementUnlockModalProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementUnlockModal({ achievement, onClose }: AchievementUnlockModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
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
            <span className="text-6xl">{achievement.icon}</span>
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
            {achievement.name}
          </h3>
          <p className="text-gray-600">
            {achievement.description}
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
            +{achievement.expReward}
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
            ${achievement.category === 'beginner' ? 'bg-blue-100 text-blue-800' : ''}
            ${achievement.category === 'intermediate' ? 'bg-purple-100 text-purple-800' : ''}
            ${achievement.category === 'advanced' ? 'bg-orange-100 text-orange-800' : ''}
            ${achievement.category === 'master' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {achievement.category === 'beginner' && '新手'}
            {achievement.category === 'intermediate' && '进阶'}
            {achievement.category === 'advanced' && '高级'}
            {achievement.category === 'master' && '大师'}
          </span>
        </motion.div>

        {/* Confirm button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3"
          >
            太棒了！继续努力
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
