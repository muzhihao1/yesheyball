/**
 * SkillCard Component
 *
 * Displays a single skill card with progress visualization.
 * Used in the SkillsOverview grid to show all 10 core skills.
 */

import { memo } from 'react';
import { Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SkillV3, UserSkillProgressV3 } from '@/hooks/useSkillsV3';

interface SkillCardProps {
  skill: SkillV3;
  progress?: UserSkillProgressV3;
  isLocked?: boolean;
  onClick: () => void;
}

// Color mapping by skill order
const SKILL_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'from-emerald-400 to-green-500', border: 'border-emerald-400', text: 'text-emerald-600' },
  2: { bg: 'from-blue-400 to-blue-500', border: 'border-blue-400', text: 'text-blue-600' },
  3: { bg: 'from-purple-400 to-purple-500', border: 'border-purple-400', text: 'text-purple-600' },
  4: { bg: 'from-orange-400 to-orange-500', border: 'border-orange-400', text: 'text-orange-600' },
  5: { bg: 'from-pink-400 to-pink-500', border: 'border-pink-400', text: 'text-pink-600' },
  6: { bg: 'from-indigo-400 to-indigo-500', border: 'border-indigo-400', text: 'text-indigo-600' },
  7: { bg: 'from-red-400 to-red-500', border: 'border-red-400', text: 'text-red-600' },
  8: { bg: 'from-amber-400 to-yellow-500', border: 'border-amber-400', text: 'text-amber-600' },
  9: { bg: 'from-teal-400 to-cyan-500', border: 'border-teal-400', text: 'text-teal-600' },
  10: { bg: 'from-violet-400 to-purple-600', border: 'border-violet-400', text: 'text-violet-600' },
};

function SkillCard({ skill, progress, isLocked = false, onClick }: SkillCardProps) {
  const colors = SKILL_COLORS[skill.skillOrder] || SKILL_COLORS[1];
  const progressPercentage = progress?.progressPercentage || 0;
  const completedSubSkills = progress?.completedSubSkills || 0;
  const totalXP = progress?.totalXpEarned || 0;
  const isCompleted = progressPercentage === 100;

  return (
    <Card
      className={`
        relative overflow-hidden cursor-pointer transition-all duration-300
        ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 hover:shadow-2xl'}
        ${isCompleted ? 'ring-2 ring-green-400' : ''}
      `}
      onClick={() => !isLocked && onClick()}
    >
      {/* Background Gradient Header */}
      <div className={`h-32 bg-gradient-to-br ${colors.bg} relative`}>
        {/* Skill Icon/Number */}
        <div className="absolute top-4 left-4">
          {isLocked ? (
            <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Lock className="w-8 h-8 text-white" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/40">
              <span className="text-3xl font-bold text-white">
                {skill.skillOrder}
              </span>
            </div>
          )}
        </div>

        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-500 text-white border-none shadow-lg">
              <CheckCircle className="w-4 h-4 mr-1" />
              已完成
            </Badge>
          </div>
        )}

        {/* Progress Circle - Bottom Center */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="relative w-24 h-24">
            {/* Background Circle */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="white"
                stroke="#E5E7EB"
                strokeWidth="6"
              />
              {/* Progress Arc */}
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
                className={isLocked ? 'text-gray-400' : colors.text}
                style={{
                  transition: 'stroke-dashoffset 0.7s ease-out',
                }}
              />
            </svg>

            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold ${isLocked ? 'text-gray-400' : colors.text}`}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="pt-16 pb-6 px-6">
        {/* Skill Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
          {skill.title}
        </h3>

        {/* Skill Description */}
        <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2 min-h-[40px]">
          {skill.description || '暂无描述'}
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {/* Sub-Skills Progress */}
          <div className="text-center flex-1">
            <div className="text-xs text-gray-500 mb-1">子技能</div>
            <div className={`text-sm font-semibold ${isLocked ? 'text-gray-400' : colors.text}`}>
              {isLocked ? '🔒' : `${completedSubSkills}/3`}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-2" />

          {/* Total XP */}
          <div className="text-center flex-1">
            <div className="text-xs text-gray-500 mb-1">总XP</div>
            <div className={`text-sm font-semibold ${isLocked ? 'text-gray-400' : colors.text}`}>
              {isLocked ? '🔒' : totalXP}
            </div>
          </div>
        </div>

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">完成前置技能后解锁</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(SkillCard);
