/**
 * Training Unit Card Component
 *
 * Displays a training unit with status, type, XP reward, and estimated time.
 * Part of the V2.1 Advanced Training System (Level 4-8).
 *
 * Features:
 * - Visual status indicator (not_started, in_progress, completed)
 * - Unit type badges (theory, practice, assessment, integration)
 * - XP reward and estimated time display
 * - Expandable content with details
 * - Progress tracking integration
 * - Responsive design with hover states
 *
 * Props:
 * - unit: Training unit data with content and progress
 * - onStatusChange: Callback when user updates status
 * - isExpanded: Control expansion state
 * - onToggleExpand: Callback for expansion toggle
 *
 * Usage:
 * ```tsx
 * <TrainingUnitCard
 *   unit={trainingUnit}
 *   onStatusChange={(status) => updateProgress({ unitId: unit.id, status })}
 *   isExpanded={expandedId === unit.id}
 *   onToggleExpand={() => toggleExpand(unit.id)}
 * />
 * ```
 */

import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Dumbbell,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Trophy,
  ChevronDown,
  ChevronUp,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Type Definitions
// ============================================================================

interface TrainingUnitContent {
  theory: string;
  steps: string[];
  tips: string[];
  common_mistakes: string[];
  practice_requirements: {
    min_duration_minutes: number;
    success_rate?: number;
    key_checkpoints: string[];
  };
  success_criteria: string[];
  related_courses: string[];
}

export interface TrainingUnit {
  id: string;
  title: string;
  unitType: string;
  unitOrder: number;
  xpReward: number;
  estimatedMinutes: number;
  content: TrainingUnitContent;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt: string | null;
}

interface TrainingUnitCardProps {
  unit: TrainingUnit;
  onStatusChange?: (status: 'not_started' | 'in_progress' | 'completed') => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  disabled?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get unit type display configuration
 * Maps unit types to Chinese labels, colors, and icons
 */
function getUnitTypeConfig(unitType: string) {
  const typeMap: Record<string, { label: string; color: string; icon: any; gradient: string }> = {
    theory: {
      label: '理论学习',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: BookOpen,
      gradient: 'from-blue-50 to-blue-100',
    },
    practice: {
      label: '实践训练',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: Dumbbell,
      gradient: 'from-green-50 to-green-100',
    },
    assessment: {
      label: '技能测评',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: Target,
      gradient: 'from-purple-50 to-purple-100',
    },
    integration: {
      label: '综合应用',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: Trophy,
      gradient: 'from-orange-50 to-orange-100',
    },
  };

  return typeMap[unitType] || typeMap.theory;
}

/**
 * Get status display configuration
 * Maps status to Chinese labels, colors, and icons
 */
function getStatusConfig(status: string) {
  const statusMap: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
    not_started: {
      label: '未开始',
      color: 'text-gray-600',
      icon: Circle,
      bgColor: 'bg-gray-100',
    },
    in_progress: {
      label: '进行中',
      color: 'text-blue-600',
      icon: Play,
      bgColor: 'bg-blue-50',
    },
    completed: {
      label: '已完成',
      color: 'text-green-600',
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
    },
  };

  return statusMap[status] || statusMap.not_started;
}

// ============================================================================
// Main Component
// ============================================================================

export function TrainingUnitCard({
  unit,
  onStatusChange,
  isExpanded = false,
  onToggleExpand,
  disabled = false,
}: TrainingUnitCardProps) {
  const typeConfig = getUnitTypeConfig(unit.unitType);
  const statusConfig = getStatusConfig(unit.status);
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  /**
   * Handle status button clicks
   * Cycles through: not_started -> in_progress -> completed
   */
  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !onStatusChange) return;

    const statusFlow: Record<string, 'not_started' | 'in_progress' | 'completed'> = {
      not_started: 'in_progress',
      in_progress: 'completed',
      completed: 'not_started', // Allow reset for practice
    };

    onStatusChange(statusFlow[unit.status]);
  };

  /**
   * Handle card click for expansion
   */
  const handleCardClick = () => {
    if (!disabled && onToggleExpand) {
      onToggleExpand();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all duration-300 hover:shadow-lg',
          'border-l-4',
          unit.status === 'completed' && 'border-l-green-500 bg-green-50/30',
          unit.status === 'in_progress' && 'border-l-blue-500 bg-blue-50/30',
          unit.status === 'not_started' && 'border-l-gray-300',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              {/* Unit Title */}
              <CardTitle className="text-lg flex items-center gap-2">
                <TypeIcon className="h-5 w-5 flex-shrink-0" />
                <span className="line-clamp-2">{unit.title}</span>
              </CardTitle>

              {/* Unit Type and Status Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={cn('text-xs font-medium', typeConfig.color)}
                >
                  {typeConfig.label}
                </Badge>

                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-medium flex items-center gap-1',
                    statusConfig.color,
                    statusConfig.bgColor
                  )}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            {onToggleExpand && (
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Metadata: XP and Time */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="font-medium">{unit.xpReward} XP</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{unit.estimatedMinutes} 分钟</span>
            </div>
          </div>

          {/* Status Action Button */}
          {onStatusChange && (
            <div className="flex gap-2">
              {unit.status === 'not_started' && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleStatusClick}
                  disabled={disabled}
                >
                  开始训练
                </Button>
              )}

              {unit.status === 'in_progress' && (
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleStatusClick}
                  disabled={disabled}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  标记完成
                </Button>
              )}

              {unit.status === 'completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={handleStatusClick}
                  disabled={disabled}
                >
                  重新练习
                </Button>
              )}
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t space-y-4"
            >
              {/* Theory Section */}
              {unit.content.theory && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    理论基础
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {unit.content.theory}
                  </p>
                </div>
              )}

              {/* Training Steps */}
              {unit.content.steps && unit.content.steps.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">训练步骤</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    {unit.content.steps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tips */}
              {unit.content.tips && unit.content.tips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-700">训练技巧</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {unit.content.tips.map((tip, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {unit.content.common_mistakes && unit.content.common_mistakes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-red-700">常见错误</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {unit.content.common_mistakes.map((mistake, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Criteria */}
              {unit.content.success_criteria && unit.content.success_criteria.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-purple-700">成功标准</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {unit.content.success_criteria.map((criteria, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Practice Requirements */}
              {unit.content.practice_requirements && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">训练要求</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      • 最少训练时长: {unit.content.practice_requirements.min_duration_minutes} 分钟
                    </p>
                    {unit.content.practice_requirements.success_rate && (
                      <p>• 成功率目标: {unit.content.practice_requirements.success_rate}%</p>
                    )}
                    {unit.content.practice_requirements.key_checkpoints && (
                      <div>
                        <p className="font-medium mt-2">关键检查点:</p>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {unit.content.practice_requirements.key_checkpoints.map((cp, idx) => (
                            <li key={idx}>{cp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
