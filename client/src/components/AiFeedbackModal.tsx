/**
 * AI Feedback Modal Component
 *
 * Displays AI-generated coaching feedback after training completion
 *
 * Features:
 * - Animated text reveal effect
 * - Typing animation for AI feedback
 * - Share and save feedback options
 * - Smooth transitions
 *
 * Props:
 * - feedback: AI-generated coaching feedback text
 * - rating: User's training rating (1-5)
 * - onClose: Callback when modal is closed
 *
 * Usage:
 * ```tsx
 * {showFeedback && (
 *   <AiFeedbackModal
 *     feedback="今天的训练很棒..."
 *     rating={4}
 *     onClose={() => setShowFeedback(false)}
 *   />
 * )}
 * ```
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, X, MessageCircle } from 'lucide-react';

interface AiFeedbackModalProps {
  feedback: string;
  rating: number;
  onClose: () => void;
}

export function AiFeedbackModal({
  feedback,
  rating,
  onClose,
}: AiFeedbackModalProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Typing animation effect
  useEffect(() => {
    if (!feedback) {
      setIsTypingComplete(true);
      return;
    }

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= feedback.length) {
        setDisplayedText(feedback.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 20); // Typing speed: 20ms per character

    return () => clearInterval(typingInterval);
  }, [feedback]);

  const getRatingEmoji = (rating: number): string => {
    if (rating >= 5) return '🌟';
    if (rating >= 4) return '🎯';
    if (rating >= 3) return '💪';
    if (rating >= 2) return '📈';
    return '🔰';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI 教练反馈</h2>
              <p className="text-blue-100 text-sm mt-1">
                基于你的训练表现生成的个性化建议
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Rating Badge */}
          <motion.div
            className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-2xl">{getRatingEmoji(rating)}</span>
            <span className="text-sm text-gray-700">
              训练评分: <span className="font-semibold text-blue-600">{rating}/5</span>
            </span>
          </motion.div>

          {/* AI Feedback Text */}
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">教练说：</p>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {displayedText}
                    {!isTypingComplete && (
                      <motion.span
                        className="inline-block w-2 h-4 bg-blue-500 ml-1"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer Info */}
          {isTypingComplete && (
            <motion.div
              className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-gray-600 leading-relaxed">
                💡 <span className="font-medium">小提示：</span>
                AI 教练会根据你的训练类型、时长和评分生成个性化建议。
                坚持记录训练笔记能获得更精准的指导！
              </p>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold"
            disabled={!isTypingComplete}
          >
            {isTypingComplete ? '好的，我知道了' : '生成中...'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
