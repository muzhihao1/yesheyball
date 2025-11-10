/**
 * Sub-Skill Group Component
 *
 * Groups multiple training units under a sub-skill category with progress tracking.
 * Part of the Fu Jiajun V2.1 Training System (Level 4-8).
 *
 * Features:
 * - Sub-skill header with name and description
 * - Progress bar showing completion percentage
 * - Statistics: completed/total units, earned/available XP
 * - Collapsible section to show/hide training units
 * - Batch actions for all units in the group
 * - Visual progress indicators with animations
 *
 * Props:
 * - subSkill: Sub-skill data containing multiple training units
 * - onUnitStatusChange: Callback when any unit's status changes
 * - defaultExpanded: Initial expansion state
 *
 * Usage:
 * ```tsx
 * <SubSkillGroup
 *   subSkill={subSkillData}
 *   onUnitStatusChange={(unitId, status) => {
 *     updateProgress({ unitId, status });
 *   }}
 *   defaultExpanded={false}
 * />
 * ```
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Trophy,
  Target,
  CheckCircle2,
  Circle,
  Play,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrainingUnitCard, type TrainingUnit } from './TrainingUnitCard';
import { cn } from '@/lib/utils';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SubSkill {
  id: string;
  skillId: string;
  subSkillName: string;
  subSkillOrder: number;
  description: string | null;
  units: TrainingUnit[];
}

interface SubSkillGroupProps {
  subSkill: SubSkill;
  onUnitStatusChange?: (unitId: string, status: 'not_started' | 'in_progress' | 'completed') => void;
  defaultExpanded?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate sub-skill statistics from training units
 */
function calculateSubSkillStats(units: TrainingUnit[]) {
  const total = units.length;
  const completed = units.filter((u) => u.status === 'completed').length;
  const inProgress = units.filter((u) => u.status === 'in_progress').length;
  const notStarted = units.filter((u) => u.status === 'not_started').length;

  const totalXP = units.reduce((sum, u) => sum + (u.xpReward || 0), 0);
  const earnedXP = units
    .filter((u) => u.status === 'completed')
    .reduce((sum, u) => sum + (u.xpReward || 0), 0);

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    notStarted,
    totalXP,
    earnedXP,
    completionPercentage,
  };
}

// ============================================================================
// Main Component
// ============================================================================

export function SubSkillGroup({
  subSkill,
  onUnitStatusChange,
  defaultExpanded = false,
}: SubSkillGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);

  // Calculate statistics
  const stats = useMemo(() => calculateSubSkillStats(subSkill.units), [subSkill.units]);

  /**
   * Handle unit card expansion
   * Only one unit can be expanded at a time
   */
  const handleToggleUnitExpand = (unitId: string) => {
    setExpandedUnitId((prev) => (prev === unitId ? null : unitId));
  };

  /**
   * Handle status change for a training unit
   */
  const handleUnitStatusChange = (unitId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    if (onUnitStatusChange) {
      onUnitStatusChange(unitId, status);
    }
  };

  /**
   * Get progress bar color based on completion percentage
   */
  const getProgressColor = () => {
    if (stats.completionPercentage === 100) return 'bg-green-600';
    if (stats.completionPercentage >= 50) return 'bg-blue-600';
    if (stats.completionPercentage > 0) return 'bg-yellow-600';
    return 'bg-gray-300';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border rounded-lg bg-white shadow-sm overflow-hidden"
    >
      {/* Sub-Skill Header */}
      <div
        className={cn(
          'p-4 cursor-pointer transition-colors duration-200',
          'hover:bg-gray-50',
          stats.completionPercentage === 100 && 'bg-green-50/50'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Title + Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Expansion Icon */}
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
              </motion.div>

              {/* Sub-Skill Name */}
              <h3 className="font-semibold text-lg text-gray-900 truncate">
                {subSkill.subSkillName}
              </h3>

              {/* Completion Badge */}
              {stats.completionPercentage === 100 && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  已完成
                </Badge>
              )}
            </div>

            {/* Description */}
            {subSkill.description && (
              <p className="text-sm text-muted-foreground ml-7 line-clamp-2">
                {subSkill.description}
              </p>
            )}

            {/* Progress Bar */}
            <div className="ml-7 mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>训练进度</span>
                <span className="font-medium">{stats.completionPercentage}%</span>
              </div>
              <Progress
                value={stats.completionPercentage}
                className="h-2"
                indicatorClassName={cn('transition-all duration-500', getProgressColor())}
              />
            </div>
          </div>

          {/* Right: Statistics */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Units Progress */}
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-muted-foreground">
                {stats.completed}/{stats.total} 单元
              </span>
            </div>

            {/* XP Progress */}
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-muted-foreground">
                {stats.earnedXP}/{stats.totalXP} XP
              </span>
            </div>

            {/* Status Summary */}
            <div className="flex gap-1.5 mt-1">
              {stats.completed > 0 && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  {stats.completed} 完成
                </Badge>
              )}
              {stats.inProgress > 0 && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  {stats.inProgress} 进行中
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Training Units List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 bg-gray-50/50">
              {/* Quick Stats Bar */}
              <div className="flex items-center gap-4 pt-4 pb-2 text-xs text-muted-foreground border-b">
                <div className="flex items-center gap-1.5">
                  <Circle className="h-3 w-3 text-gray-400" />
                  <span>{stats.notStarted} 未开始</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Play className="h-3 w-3 text-blue-600" />
                  <span>{stats.inProgress} 进行中</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>{stats.completed} 已完成</span>
                </div>
              </div>

              {/* Training Unit Cards */}
              {subSkill.units.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>暂无训练单元</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subSkill.units.map((unit) => (
                    <TrainingUnitCard
                      key={unit.id}
                      unit={unit}
                      onStatusChange={(status) => handleUnitStatusChange(unit.id, status)}
                      isExpanded={expandedUnitId === unit.id}
                      onToggleExpand={() => handleToggleUnitExpand(unit.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
