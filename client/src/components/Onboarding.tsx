/**
 * Onboarding Component - First-time user guide
 *
 * Features:
 * - 4-step guided tour of the platform
 * - Smooth animations using Framer Motion
 * - Progress indicator with dots
 * - Skip and completion handlers
 * - LocalStorage persistence to show only once
 *
 * Usage:
 * ```tsx
 * <Onboarding onComplete={() => setShowOnboarding(false)} />
 * ```
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  icon: string;
  title: string;
  description: string;
  tip?: string;
}

const steps: OnboardingStep[] = [
  {
    icon: '👋',
    title: '欢迎来到三个月一杆清台！',
    description: '让我们用30秒了解如何开始你的台球大师之路',
    tip: '您可以随时点击右上角的 ✕ 跳过引导'
  },
  {
    icon: '🗺️',
    title: '关卡地图',
    description: '这是你的主要学习路径，跟随关卡循序渐进地提升球技',
    tip: '每个关卡包含多个练习题，完成后解锁下一关'
  },
  {
    icon: '💪',
    title: '训练计划',
    description: '除了关卡，你还可以进行专项训练，针对性提升准度和力度',
    tip: 'AI 教练会根据你的训练数据提供个性化反馈'
  },
  {
    icon: '🚀',
    title: '开始训练吧！',
    description: '完成训练可以获得经验值和成就，冲击排行榜，与其他学员一较高下',
    tip: '坚持每天训练，建立连续训练记录获得额外奖励'
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Mark onboarding as completed in localStorage
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <motion.div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="跳过引导"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-full">
                <span className="text-5xl">{steps[currentStep].icon}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {steps[currentStep].title}
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {steps[currentStep].description}
              </p>

              {/* Tip */}
              {steps[currentStep].tip && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg mb-6">
                  <p className="text-sm text-blue-700 text-left">
                    💡 <span className="font-medium">提示：</span>{steps[currentStep].tip}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentStep
                    ? 'w-8 h-2 bg-green-500'
                    : index < currentStep
                    ? 'w-2 h-2 bg-green-300'
                    : 'w-2 h-2 bg-gray-300'
                }`}
                aria-label={`跳转到第 ${index + 1} 步`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一步
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={`${currentStep === 0 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600`}
            >
              {currentStep === steps.length - 1 ? (
                '开始使用'
              ) : (
                <>
                  下一步
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Skip link */}
          {currentStep < steps.length - 1 && (
            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                跳过引导
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Check if user has completed onboarding
 * @returns {boolean} True if onboarding has been completed
 */
export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem('onboarding_completed') === 'true';
}

/**
 * Reset onboarding status (useful for testing)
 */
export function resetOnboarding(): void {
  localStorage.removeItem('onboarding_completed');
}
