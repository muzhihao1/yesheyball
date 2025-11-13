/**
 * SkillsOverview Component
 *
 * Displays all 10 core skills in a responsive grid layout.
 * Entry point for users to select which skill to learn.
 */

import { memo } from 'react';
import SkillCard from './SkillCard';
import type { SkillV3, UserSkillProgressV3 } from '@/hooks/useSkillsV3';

interface SkillsOverviewProps {
  skills: SkillV3[];
  userProgress: UserSkillProgressV3[];
  onSkillClick: (skill: SkillV3) => void;
}

function SkillsOverview({ skills, userProgress, onSkillClick }: SkillsOverviewProps) {
  // Create a progress map for quick lookup
  const progressMap = new Map<string, UserSkillProgressV3>();
  userProgress.forEach((progress) => {
    progressMap.set(progress.skillId, progress);
  });

  // Determine unlock logic (sequential unlock based on previous skill completion)
  const getSkillLockStatus = (skill: SkillV3): boolean => {
    // First skill is always unlocked
    if (skill.skillOrder === 1) return false;

    // Check if previous skill is fully completed
    const previousSkillOrder = skill.skillOrder - 1;
    const previousSkill = skills.find((s) => s.skillOrder === previousSkillOrder);

    if (!previousSkill) return true; // Lock if previous skill not found

    const previousProgress = progressMap.get(previousSkill.id);

    // Unlock if previous skill is 100% complete (all 3 sub-skills done)
    return !previousProgress || previousProgress.completedSubSkills < 3;
  };

  // Sort skills by skill order
  const sortedSkills = [...skills].sort((a, b) => a.skillOrder - b.skillOrder);

  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎱</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">暂无技能数据</h3>
        <p className="text-gray-500">十大招技能系统正在加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          耶氏台球十大招
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          掌握十大核心技能，从基本功到战略思维，系统化提升台球水平
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {sortedSkills.map((skill) => {
          const progress = progressMap.get(skill.id);
          const isLocked = getSkillLockStatus(skill);

          return (
            <SkillCard
              key={skill.id}
              skill={skill}
              progress={progress}
              isLocked={isLocked}
              onClick={() => onSkillClick(skill)}
            />
          );
        })}
      </div>

      {/* Legend/Help Text */}
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <h4 className="font-bold text-blue-700 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          学习指南
        </h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>每个技能包含3个子技能，每个子技能有理论、练习和挑战单元</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>必须按顺序完成，完成前一个技能才能解锁下一个</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>完成训练单元可获得XP奖励，提升你的整体水平</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>点击技能卡片查看详细内容和开始学习</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default memo(SkillsOverview);
