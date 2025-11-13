/**
 * Rating Modal Component
 *
 * Interactive rating modal with star selection and optional feedback
 *
 * Features:
 * - Interactive star rating (1-5 stars with hover effects)
 * - Optional text feedback input
 * - AI-powered coaching feedback generation
 * - Smooth animations and transitions
 * - Responsive design
 *
 * Props:
 * - sessionType: Type of training session
 * - duration: Training duration in seconds
 * - notes: User's training notes
 * - onSubmit: Callback with rating and feedback
 * - onCancel: Callback when user cancels
 *
 * Usage:
 * ```tsx
 * <RatingModal
 *   sessionType="系统训练"
 *   duration={1800}
 *   notes="今天练习了瞄准"
 *   onSubmit={(rating, feedback) => handleRatingSubmit(rating, feedback)}
 *   onCancel={() => setShowRating(false)}
 * />
 * ```
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Sparkles, Loader2 } from 'lucide-react';

interface RatingModalProps {
  sessionType: string;
  duration: number | undefined;
  notes?: string;
  onSubmit: (rating: number, feedback?: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isOpen?: boolean; // For compatibility with old usage
  onClose?: () => void; // For compatibility with old usage
}

export function RatingModal({
  sessionType,
  duration,
  notes,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');

  const ratingLabels = {
    1: '需要改进',
    2: '一般般',
    3: '还不错',
    4: '很满意',
    5: '非常棒！'
  };

  const handleSubmit = () => {
    if (rating === 0) {
      return; // Must select a rating
    }
    onSubmit(rating, feedback || undefined);
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (seconds === undefined || isNaN(seconds)) {
      return '0分0秒';
    }
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <motion.div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">训练评价</h2>
          </div>
          <p className="text-green-100 text-sm">
            {sessionType} • {formatDuration(duration)}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-800">
              这次训练的感觉如何？
            </Label>
            <div className="flex justify-center gap-3 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full p-1 transition-transform active:scale-95"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star
                    className={`w-12 h-12 transition-all duration-200 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                        : 'fill-gray-200 text-gray-300'
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            {/* Rating Label */}
            {(rating > 0 || hoveredRating > 0) && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-lg font-medium text-gray-700">
                  {ratingLabels[(hoveredRating || rating) as keyof typeof ratingLabels]}
                </p>
              </motion.div>
            )}
          </div>

          {/* Optional Feedback */}
          <div className="space-y-2">
            <Label htmlFor="additional-feedback" className="text-sm font-medium text-gray-700">
              补充说明（可选）
            </Label>
            <Textarea
              id="additional-feedback"
              placeholder="今天有什么特别的感受或发现吗？例如：某个技巧有突破、遇到的困难等..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="resize-none focus:ring-green-500"
            />
            <p className="text-xs text-gray-500">
              💡 添加更多细节能帮助 AI 教练给出更精准的建议
            </p>
          </div>

          {/* Training Notes Preview */}
          {notes && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">训练笔记：</p>
              <p className="text-sm text-gray-800">{notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              继续训练
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成反馈中...
                </>
              ) : (
                '提交评价'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
