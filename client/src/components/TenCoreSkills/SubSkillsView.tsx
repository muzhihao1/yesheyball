/**
 * SubSkillsView Component
 *
 * Displays the 3 sub-skills for a selected skill with their training units.
 * Implements sequential unlock logic and collapsible sections.
 */

import { memo, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Lock, CheckCircle, PlayCircle, BookOpen, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  useSubSkillsV3,
  useTrainingUnitsV3,
  useSubSkillCompletionStats,
  type SkillV3,
  type SubSkillV3,
  type TrainingUnitV3,
} from '@/hooks/useSkillsV3';

interface SubSkillsViewProps {
  skill: SkillV3;
  onBack: () => void;
  onUnitClick: (unit: TrainingUnitV3) => void;
}

// Sub-component for individual sub-skill section
interface SubSkillSectionProps {
  subSkill: SubSkillV3;
  isLocked: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onUnitClick: (unit: TrainingUnitV3) => void;
}

function SubSkillSection({ subSkill, isLocked, isExpanded, onToggle, onUnitClick }: SubSkillSectionProps) {
  const { data: units, isLoading: unitsLoading } = useTrainingUnitsV3(isExpanded ? subSkill.id : '');
  const stats = useSubSkillCompletionStats(subSkill.id);

  // Get icon by unit type
  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'theory':
        return <BookOpen className="w-4 h-4" />;
      case 'practice':
        return <Target className="w-4 h-4" />;
      case 'challenge':
        return <Zap className="w-4 h-4" />;
      default:
        return <PlayCircle className="w-4 h-4" />;
    }
  };

  // Get color theme by unit type
  const getUnitTheme = (type: string) => {
    switch (type) {
      case 'theory':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-700',
          icon: 'text-blue-500',
        };
      case 'practice':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-700',
          icon: 'text-green-500',
        };
      case 'challenge':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-500',
          text: 'text-orange-700',
          icon: 'text-orange-500',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-500',
          text: 'text-gray-700',
          icon: 'text-gray-500',
        };
    }
  };

  // Get unit type label
  const getUnitTypeLabel = (type: string) => {
    switch (type) {
      case 'theory':
        return '理论';
      case 'practice':
        return '练习';
      case 'challenge':
        return '挑战';
      default:
        return '单元';
    }
  };

  return (
    <Card className={`${isLocked ? 'opacity-60' : ''}`}>
      <CardContent className="p-0">
        {/* Sub-Skill Header - Clickable */}
        <button
          onClick={() => !isLocked && onToggle()}
          disabled={isLocked}
          className="w-full p-6 text-left hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            {/* Left: Title and Progress */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-bold text-gray-800">{subSkill.title}</h3>
                {isLocked ? (
                  <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                    <Lock className="w-3 h-3 mr-1" />
                    未解锁
                  </Badge>
                ) : stats.isFullyCompleted ? (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    已完成
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    进行中
                  </Badge>
                )}
              </div>

              {subSkill.description && (
                <p className="text-sm text-gray-600 mb-3">{subSkill.description}</p>
              )}

              {/* Progress Bar */}
              {!isLocked && (
                <div className="flex items-center space-x-3">
                  <Progress value={stats.completionPercentage} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                    {stats.completedCount}/{stats.totalCount} ({stats.completionPercentage}%)
                  </span>
                </div>
              )}
            </div>

            {/* Right: Expand/Collapse Icon */}
            <div className="ml-4">
              {isLocked ? (
                <Lock className="w-5 h-5 text-gray-400" />
              ) : isExpanded ? (
                <ChevronDown className="w-6 h-6 text-gray-500" />
              ) : (
                <ChevronRight className="w-6 h-6 text-gray-500" />
              )}
            </div>
          </div>
        </button>

        {/* Training Units List - Expanded */}
        {isExpanded && !isLocked && (
          <div className="border-t border-gray-200 p-6 pt-4 bg-gray-50">
            {unitsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : units && units.length > 0 ? (
              <div className="space-y-3">
                {units.map((unit, index) => {
                  const theme = getUnitTheme(unit.unitType);
                  const isCompleted = stats.completedCount > index; // Simple sequential completion check
                  const isCurrentUnit = stats.completedCount === index;
                  const isUnitLocked = stats.completedCount < index;

                  return (
                    <button
                      key={unit.id}
                      onClick={() => !isUnitLocked && onUnitClick(unit)}
                      disabled={isUnitLocked}
                      className={`
                        w-full p-4 rounded-lg border-l-4 transition-all
                        ${theme.bg} ${theme.border}
                        ${isUnitLocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                        ${isCurrentUnit ? 'ring-2 ring-blue-400 shadow-lg' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        {/* Left: Unit Info */}
                        <div className="flex items-center space-x-3 flex-1">
                          {/* Icon */}
                          <div className={`${theme.icon}`}>
                            {getUnitIcon(unit.unitType)}
                          </div>

                          {/* Title and Details */}
                          <div className="text-left flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-xs font-semibold ${theme.text} px-2 py-0.5 rounded`}>
                                {getUnitTypeLabel(unit.unitType)}
                              </span>
                              <h4 className="text-sm font-semibold text-gray-800">{unit.title}</h4>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              {unit.estimatedMinutes && (
                                <span>⏱ {unit.estimatedMinutes}分钟</span>
                              )}
                              <span>+{unit.xpReward} XP</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Status Icon */}
                        <div className="ml-3">
                          {isUnitLocked ? (
                            <Lock className="w-5 h-5 text-gray-400" />
                          ) : isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : isCurrentUnit ? (
                            <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse" />
                          ) : (
                            <PlayCircle className={`w-5 h-5 ${theme.icon}`} />
                          )}
                        </div>
                      </div>

                      {/* Goal Description (if exists) */}
                      {unit.goalDescription && !isUnitLocked && (
                        <p className="text-xs text-gray-600 mt-2 text-left pl-7">
                          目标: {unit.goalDescription}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无训练单元</p>
              </div>
            )}

            {/* Unlock Condition */}
            {subSkill.unlockCondition && (
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">解锁条件:</span> {subSkill.unlockCondition}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Locked Message */}
        {isExpanded && isLocked && (
          <div className="border-t border-gray-200 p-6 text-center bg-gray-50">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">完成上一个子技能后解锁</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SubSkillsView({ skill, onBack, onUnitClick }: SubSkillsViewProps) {
  const { data: subSkills, isLoading } = useSubSkillsV3(skill.id);
  const [expandedSubSkills, setExpandedSubSkills] = useState<Set<string>>(new Set());

  // Toggle sub-skill expansion
  const toggleSubSkill = (subSkillId: string) => {
    setExpandedSubSkills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subSkillId)) {
        newSet.delete(subSkillId);
      } else {
        newSet.add(subSkillId);
      }
      return newSet;
    });
  };

  // Determine lock status (sequential unlock)
  const getSubSkillLockStatus = (subSkill: SubSkillV3): boolean => {
    if (!subSkills) return true;

    // First sub-skill is always unlocked
    if (subSkill.subSkillOrder === 1) return false;

    // Check if previous sub-skill is fully completed
    const previousSubSkillOrder = subSkill.subSkillOrder - 1;
    const previousSubSkill = subSkills.find((s) => s.subSkillOrder === previousSubSkillOrder);

    if (!previousSubSkill) return true;

    // For now, check completion via stats (in real impl, check from completion data)
    // Simplified: if previous sub-skill exists, unlock current (will improve with completion data)
    return false; // TODO: Implement proper completion check
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />

        {/* Sub-Skills Skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!subSkills || subSkills.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">暂无子技能</h3>
          <p className="text-gray-500">该技能的子技能内容正在准备中...</p>
        </div>
      </div>
    );
  }

  // Sort sub-skills by order
  const sortedSubSkills = [...subSkills].sort((a, b) => a.subSkillOrder - b.subSkillOrder);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button onClick={onBack} variant="ghost" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回技能列表
      </Button>

      {/* Skill Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{skill.title}</h1>
              <p className="text-blue-100">{skill.description}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{sortedSubSkills.length}</div>
              <p className="text-blue-100 text-sm">个子技能</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Path Indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
        <span>学习路径:</span>
        {sortedSubSkills.map((subSkill, index) => (
          <div key={subSkill.id} className="flex items-center">
            <span className="font-medium">{subSkill.subSkillOrder}</span>
            {index < sortedSubSkills.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Sub-Skills List */}
      <div className="space-y-4">
        {sortedSubSkills.map((subSkill) => {
          const isLocked = getSubSkillLockStatus(subSkill);
          const isExpanded = expandedSubSkills.has(subSkill.id);

          return (
            <SubSkillSection
              key={subSkill.id}
              subSkill={subSkill}
              isLocked={isLocked}
              isExpanded={isExpanded}
              onToggle={() => toggleSubSkill(subSkill.id)}
              onUnitClick={onUnitClick}
            />
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <h4 className="font-bold text-blue-700 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          学习提示
        </h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>
              每个子技能包含理论、练习和挑战三种类型的训练单元
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>必须按顺序完成训练单元才能解锁下一个</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>完成所有训练单元后，子技能标记为已完成</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>点击训练单元查看详细内容并开始学习</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default memo(SubSkillsView);
