/**
 * Level Accordion Component
 *
 * Top-level organizational component for a training level (Level 4-8).
 * Contains multiple skills, each with sub-skills and training units.
 * Part of the Fu Jiajun V2.1 Training System.
 *
 * Features:
 * - Level header with number, title, and description
 * - Aggregate progress tracking across all skills
 * - Visual level badge with color coding
 * - Collapsible accordion with smooth animations
 * - Statistics dashboard (units, XP, completion rate)
 * - Nested skill and sub-skill organization
 * - Responsive design with mobile optimization
 *
 * Props:
 * - level: Complete level data with nested skills, sub-skills, and units
 * - onUnitStatusChange: Callback when any unit's status changes
 * - defaultExpanded: Initial expansion state
 *
 * Usage:
 * ```tsx
 * {levels.map(level => (
 *   <LevelAccordion
 *     key={level.id}
 *     level={level}
 *     onUnitStatusChange={(unitId, status) => {
 *       updateProgress({ unitId, status });
 *     }}
 *     defaultExpanded={level.levelNumber === currentLevel}
 *   />
 * ))}
 * ```
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Star,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SubSkillGroup, type SubSkill } from './SubSkillGroup';
import type { TrainingUnit } from './TrainingUnitCard';
import { cn } from '@/lib/utils';

// ============================================================================
// Type Definitions
// ============================================================================

interface Skill {
  id: string;
  levelId: string;
  skillName: string;
  skillOrder: number;
  description: string | null;
  subSkills: SubSkill[];
}

export interface TrainingLevel {
  id: string;
  levelNumber: number;
  title: string;
  description: string | null;
  skills: Skill[];
}

interface LevelAccordionProps {
  level: TrainingLevel;
  onUnitStatusChange?: (unitId: string, status: 'not_started' | 'in_progress' | 'completed') => void;
  defaultExpanded?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate comprehensive level statistics
 * Aggregates data from all skills, sub-skills, and units
 */
function calculateLevelStats(level: TrainingLevel) {
  const allUnits: TrainingUnit[] = level.skills.flatMap((skill) =>
    skill.subSkills.flatMap((subSkill) => subSkill.units)
  );

  const total = allUnits.length;
  const completed = allUnits.filter((u) => u.status === 'completed').length;
  const inProgress = allUnits.filter((u) => u.status === 'in_progress').length;
  const notStarted = allUnits.filter((u) => u.status === 'not_started').length;

  const totalXP = allUnits.reduce((sum, u) => sum + (u.xpReward || 0), 0);
  const earnedXP = allUnits
    .filter((u) => u.status === 'completed')
    .reduce((sum, u) => sum + (u.xpReward || 0), 0);

  const totalMinutes = allUnits.reduce((sum, u) => sum + (u.estimatedMinutes || 0), 0);
  const completedMinutes = allUnits
    .filter((u) => u.status === 'completed')
    .reduce((sum, u) => sum + (u.estimatedMinutes || 0), 0);

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    notStarted,
    totalXP,
    earnedXP,
    totalMinutes,
    completedMinutes,
    completionPercentage,
  };
}

/**
 * Get level-specific color configuration
 * Each level has unique color scheme
 */
function getLevelColors(levelNumber: number) {
  const colorMap: Record<number, {
    badge: string;
    header: string;
    progress: string;
    text: string;
  }> = {
    4: {
      badge: 'bg-blue-600',
      header: 'from-blue-500 to-blue-700',
      progress: 'bg-blue-600',
      text: 'text-blue-600',
    },
    5: {
      badge: 'bg-purple-600',
      header: 'from-purple-500 to-purple-700',
      progress: 'bg-purple-600',
      text: 'text-purple-600',
    },
    6: {
      badge: 'bg-indigo-600',
      header: 'from-indigo-500 to-indigo-700',
      progress: 'bg-indigo-600',
      text: 'text-indigo-600',
    },
    7: {
      badge: 'bg-rose-600',
      header: 'from-rose-500 to-rose-700',
      progress: 'bg-rose-600',
      text: 'text-rose-600',
    },
    8: {
      badge: 'bg-amber-600',
      header: 'from-amber-500 to-amber-700',
      progress: 'bg-amber-600',
      text: 'text-amber-600',
    },
  };

  return colorMap[levelNumber] || colorMap[4];
}

// ============================================================================
// Main Component
// ============================================================================

export function LevelAccordion({
  level,
  onUnitStatusChange,
  defaultExpanded = false,
}: LevelAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Calculate statistics
  const stats = useMemo(() => calculateLevelStats(level), [level]);
  const colors = getLevelColors(level.levelNumber);

  /**
   * Handle unit status change from child components
   */
  const handleUnitStatusChange = (unitId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    if (onUnitStatusChange) {
      onUnitStatusChange(unitId, status);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-2 rounded-xl bg-white shadow-lg overflow-hidden"
    >
      {/* Level Header */}
      <div
        className={cn(
          'relative cursor-pointer transition-all duration-300',
          'hover:shadow-xl',
          stats.completionPercentage === 100 && 'ring-2 ring-green-500'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Gradient Background */}
        <div className={cn('bg-gradient-to-r p-6', colors.header)}>
          <div className="flex items-start justify-between gap-4 text-white">
            {/* Left: Level Badge + Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {/* Level Number Badge */}
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full',
                    'bg-white/20 backdrop-blur-sm border-2 border-white/40',
                    'font-bold text-xl'
                  )}
                >
                  L{level.levelNumber}
                </div>

                {/* Level Title */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold truncate">{level.title}</h2>

                  {/* Completion Badge */}
                  {stats.completionPercentage === 100 && (
                    <Badge className="mt-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      全部完成
                    </Badge>
                  )}
                </div>

                {/* Expansion Button */}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-6 w-6" />
                </motion.div>
              </div>

              {/* Description */}
              {level.description && (
                <p className="text-white/90 text-sm mt-2 ml-15 line-clamp-2">
                  {level.description}
                </p>
              )}
            </div>

            {/* Right: Quick Stats */}
            <div className="flex flex-col gap-2 text-sm flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4" />
                <span className="font-medium">{stats.completionPercentage}%</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">{stats.earnedXP}/{stats.totalXP}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 ml-15">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
              <span>总体进度</span>
              <span>{stats.completed} / {stats.total} 训练单元</span>
            </div>
            <Progress
              value={stats.completionPercentage}
              className="h-2.5 bg-white/20"
              indicatorClassName="bg-white"
            />
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Target className={cn('h-5 w-5', colors.text)} />
              <div>
                <div className="text-xs text-muted-foreground">总单元</div>
                <div className="font-semibold">{stats.total}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-xs text-muted-foreground">已完成</div>
                <div className="font-semibold text-green-600">{stats.completed}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-xs text-muted-foreground">经验值</div>
                <div className="font-semibold">{stats.earnedXP} XP</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-muted-foreground">训练时长</div>
                <div className="font-semibold">{Math.round(stats.completedMinutes)} 分钟</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills and Sub-Skills Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
              {level.skills.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mx-auto mb-3 opacity-20" />
                  <p className="text-lg">暂无训练内容</p>
                </div>
              ) : (
                level.skills.map((skill) => (
                  <div key={skill.id} className="space-y-3">
                    {/* Skill Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn('w-1 h-6 rounded-full', colors.badge)}></div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {skill.skillName}
                        </h3>
                        {skill.description && (
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Sub-Skills */}
                    <div className="space-y-3 ml-4">
                      {skill.subSkills.map((subSkill) => (
                        <SubSkillGroup
                          key={subSkill.id}
                          subSkill={subSkill}
                          onUnitStatusChange={handleUnitStatusChange}
                          defaultExpanded={false}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
