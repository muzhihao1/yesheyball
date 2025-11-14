import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import TrainingForm from './TrainingForm';
import type { TrainingSubmissionPayload, NinetyDayCurriculum } from '@/hooks/useNinetyDayTraining';

/**
 * Training Modal Component
 *
 * Modal dialog for submitting training sessions
 *
 * Features:
 * - Displays curriculum details
 * - Dynamic training form based on scoring method
 * - Integrated timer
 * - Handles form submission
 *
 * Props:
 * - open: Whether modal is visible
 * - onClose: Close handler
 * - onSubmit: Form submission handler
 * - curriculum: Current day's curriculum data
 * - isSubmitting: Loading state during submission
 */

interface TrainingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: TrainingSubmissionPayload) => void;
  curriculum: NinetyDayCurriculum | null | undefined;
  isSubmitting?: boolean;
}

export default function TrainingModal({
  open,
  onClose,
  onSubmit,
  curriculum,
  isSubmitting,
}: TrainingModalProps) {
  if (!curriculum) {
    return null;
  }

  // Determine scoring method from curriculum
  const scoringMethod = (curriculum.scoringMethod || 'completion') as 'success_rate' | 'completion';
  const difficulty = curriculum.difficulty || '中级';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {curriculum.title}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                  第{curriculum.dayNumber}天
                </span>
                <span className="text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                  {difficulty}
                </span>
                <span className="text-sm text-muted-foreground">
                  评分方式: {scoringMethod === 'success_rate' ? '成功率' : '完成度'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Curriculum Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg space-y-3">
            {curriculum.description && (
              <div>
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                  训练说明
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {curriculum.description}
                </p>
              </div>
            )}

            {curriculum.objectives && curriculum.objectives.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                  训练目标
                </h4>
                <ul className="space-y-1">
                  {curriculum.objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {curriculum.keyPoints && curriculum.keyPoints.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                  关键要点
                </h4>
                <ul className="space-y-1">
                  {curriculum.keyPoints.map((point: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Training Form */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">记录训练数据</h3>
            <TrainingForm
              dayNumber={curriculum.dayNumber}
              scoringMethod={scoringMethod}
              difficulty={difficulty}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
