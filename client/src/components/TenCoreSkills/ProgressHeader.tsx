/**
 * ProgressHeader Component
 *
 * Displays overall progress statistics across all skills.
 * Shows completion rate, total XP, and derived level.
 */

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Target } from 'lucide-react';

interface ProgressHeaderProps {
  totalSkills: number;
  completedSkills: number;
  totalXP: number;
  totalSubSkills: number;
  completedSubSkills: number;
}

function ProgressHeader({
  totalSkills,
  completedSkills,
  totalXP,
  totalSubSkills,
  completedSubSkills,
}: ProgressHeaderProps) {
  // Calculate overall progress percentage
  const skillProgressPercentage = totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0;
  const subSkillProgressPercentage =
    totalSubSkills > 0 ? (completedSubSkills / totalSubSkills) * 100 : 0;

  // Derive level from total XP (simple formula: 1 level per 100 XP)
  const derivedLevel = Math.floor(totalXP / 100) + 1;

  return (
    <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl border-none mb-8">
      <CardContent className="p-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center">
              <Trophy className="w-7 h-7 mr-2" />
              学习进度
            </h2>
            <p className="text-green-100 text-sm">耶氏台球十大招</p>
          </div>
          <div className="text-right">
            <div className="text-4xl md:text-5xl font-bold">
              {completedSkills}/{totalSkills}
            </div>
            <p className="text-green-100 text-sm">技能完成</p>
          </div>
        </div>

        {/* Main Progress Bar - Skills */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">技能进度</span>
            <span className="font-bold">{Math.round(skillProgressPercentage)}%</span>
          </div>
          <div className="bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="bg-white h-4 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${skillProgressPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* Secondary Progress Bar - Sub-Skills */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">子技能进度</span>
            <span className="font-bold">
              {completedSubSkills}/{totalSubSkills} ({Math.round(subSkillProgressPercentage)}%)
            </span>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-yellow-300 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${subSkillProgressPercentage}%`,
              }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/20">
          {/* Total XP */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalXP}</div>
              <div className="text-green-100 text-xs">总经验值</div>
            </div>
          </div>

          {/* Derived Level */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">LV {derivedLevel}</div>
              <div className="text-green-100 text-xs">当前等级</div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="flex items-center col-span-2 md:col-span-1">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(skillProgressPercentage)}%</div>
              <div className="text-green-100 text-xs">完成率</div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        {skillProgressPercentage === 100 ? (
          <div className="mt-4 p-3 bg-white/10 rounded-lg text-center">
            <p className="font-bold text-lg">🎉 恭喜！你已掌握所有十大招！</p>
            <p className="text-sm text-green-100 mt-1">继续练习保持技能水平</p>
          </div>
        ) : skillProgressPercentage >= 75 ? (
          <div className="mt-4 p-3 bg-white/10 rounded-lg text-center">
            <p className="font-bold">💪 你已经完成大部分技能，加油！</p>
          </div>
        ) : skillProgressPercentage >= 50 ? (
          <div className="mt-4 p-3 bg-white/10 rounded-lg text-center">
            <p className="font-bold">🚀 已经过半，继续前进！</p>
          </div>
        ) : skillProgressPercentage >= 25 ? (
          <div className="mt-4 p-3 bg-white/10 rounded-lg text-center">
            <p className="font-bold">🌟 良好的开始，保持学习！</p>
          </div>
        ) : skillProgressPercentage > 0 ? (
          <div className="mt-4 p-3 bg-white/10 rounded-lg text-center">
            <p className="font-bold">🎯 开启学习之旅，一步一个脚印！</p>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-white/10 rounded-lg text-center">
            <p className="font-bold">👋 欢迎开始十大招系统学习！</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(ProgressHeader);
