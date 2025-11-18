import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Lightbulb, Clock, X } from 'lucide-react';

/**
 * Day curriculum data interface
 */
export interface DayCurriculum {
  dayNumber: number;
  title: string;
  description: string;
  objectives: string[];
  keyPoints: string[];
  trainingType: string;
  difficulty: string;
  estimatedDuration?: number;
}

/**
 * Day Detail Modal Props
 */
export interface DayDetailModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Day number being viewed */
  dayNumber: number;
  /** Curriculum data for the day */
  curriculum: DayCurriculum | null;
  /** Whether the curriculum is loading */
  isLoading?: boolean;
}

/**
 * Day Detail Modal Component
 *
 * Displays detailed training curriculum information for a specific day.
 * Shows course title, description, objectives, key points, and metadata.
 *
 * Features:
 * - Responsive design for mobile and desktop
 * - Loading state handling
 * - Accessible dialog with keyboard support
 * - Visual hierarchy with icons
 * - Gradient accents matching adventure map theme
 *
 * @example
 * ```tsx
 * <DayDetailModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   dayNumber={5}
 *   curriculum={curriculumData}
 * />
 * ```
 */
export function DayDetailModal({
  open,
  onClose,
  dayNumber,
  curriculum,
  isLoading = false,
}: DayDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              第 {dayNumber} 天训练
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : curriculum ? (
          <div className="space-y-6">
            {/* Course Title */}
            <div>
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                {curriculum.title}
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                  {curriculum.trainingType}
                </span>
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
                  {curriculum.difficulty}
                </span>
                {curriculum.estimatedDuration && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {curriculum.estimatedDuration} 分钟
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {curriculum.description && (
              <div className="bg-gradient-to-br from-emerald-50/50 to-amber-50/50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">训练说明</h4>
                    <p className="text-foreground">{curriculum.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Objectives */}
            {curriculum.objectives && curriculum.objectives.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-semibold text-foreground">训练目标</h4>
                </div>
                <ul className="space-y-2 ml-7">
                  {curriculum.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1 font-bold">•</span>
                      <span className="text-foreground">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Points */}
            {curriculum.keyPoints && curriculum.keyPoints.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-foreground">关键要点</h4>
                </div>
                <ul className="space-y-2 ml-7">
                  {curriculum.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1 font-bold">✓</span>
                      <span className="text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-amber-600 hover:from-emerald-700 hover:via-green-700 hover:to-amber-700 text-white font-semibold"
              >
                开始训练
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>暂无训练内容</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
