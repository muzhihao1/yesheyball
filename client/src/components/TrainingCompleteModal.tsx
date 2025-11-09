/**
 * Training Complete Modal Component
 *
 * Celebration modal displayed when user completes a training session
 *
 * Features:
 * - Confetti celebration effect
 * - Animated star ratings (1-5 stars)
 * - Experience point increment animation
 * - Spring-based modal entrance
 * - Smooth transitions with Framer Motion
 * - Responsive design
 *
 * Props:
 * - sessionTitle: Name of completed training session
 * - earnedExp: Experience points earned
 * - stars: Rating (1-5)
 * - duration: Training duration in minutes
 * - onClose: Callback when modal is closed
 *
 * Usage:
 * ```tsx
 * {showComplete && (
 *   <TrainingCompleteModal
 *     sessionTitle="准度训练"
 *     earnedExp={150}
 *     stars={4}
 *     duration={30}
 *     onClose={() => setShowComplete(false)}
 *   />
 * )}
 * ```
 */

import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Button } from '@/components/ui/button';
import { Star, Clock, Trophy } from 'lucide-react';

interface TrainingCompleteModalProps {
  sessionTitle: string;
  earnedExp: number;
  stars: number;
  duration?: number;
  onClose: () => void;
}

export function TrainingCompleteModal({
  sessionTitle,
  earnedExp,
  stars,
  duration,
  onClose,
}: TrainingCompleteModalProps) {
  const { width, height } = useWindowSize();

  return (
    <>
      {/* Confetti Effect */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={300}
        gravity={0.3}
        colors={['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#fbbf24', '#f59e0b']}
      />

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
        <motion.div
          className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
          initial={{ scale: 0, y: 50, rotate: -5 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
        >
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
            >
              <Trophy className="w-16 h-16 mx-auto mb-3" />
            </motion.div>

            <motion.h2
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              训练完成！
            </motion.h2>

            <motion.p
              className="text-green-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {sessionTitle}
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Star Rating */}
            <motion.div
              className="flex justify-center gap-2 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{
                    delay: 0.5 + star * 0.1,
                    type: 'spring',
                    stiffness: 200
                  }}
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= stars
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-300'
                    }`}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Experience Points */}
              <motion.div
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 text-center"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.0, type: 'spring' }}
              >
                <div className="text-sm text-gray-600 mb-1">获得经验</div>
                <motion.div
                  className="text-3xl font-bold text-green-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
                >
                  +{earnedExp}
                </motion.div>
              </motion.div>

              {/* Duration */}
              {duration && (
                <motion.div
                  className="bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-xl p-4 text-center"
                  initial={{ scale: 0, rotate: 10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.0, type: 'spring' }}
                >
                  <div className="text-sm text-gray-600 mb-1">训练时长</div>
                  <div className="text-3xl font-bold text-blue-600 flex items-center justify-center gap-1">
                    <Clock className="w-6 h-6" />
                    {duration}
                    <span className="text-lg">分</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Encouragement Message */}
            <motion.div
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <p className="text-sm text-gray-700">
                {stars >= 4 ? '🎉 表现优秀！继续保持！' :
                 stars >= 3 ? '👍 做得不错！再接再厉！' :
                 '💪 继续努力，进步就在前方！'}
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 text-lg"
              >
                继续训练
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
