/**
 * Achievement Grid Component
 *
 * Displays all achievements in a responsive grid layout
 * Shows both unlocked and locked achievements with progress indicators
 *
 * Features:
 * - Responsive grid (2 columns on mobile, 3 on tablet, 4 on desktop)
 * - Visual distinction between unlocked and locked achievements
 * - Progress indicators for locked achievements
 * - Unlock timestamps for unlocked achievements
 * - Hover effects for better interaction
 *
 * Usage:
 * ```tsx
 * <AchievementGrid
 *   allAchievements={allAchievements}
 *   userAchievements={userAchievements}
 * />
 * ```
 */

import { Check } from 'lucide-react';
import type { Achievement, UserAchievement } from '@/lib/types';

interface AchievementGridProps {
  allAchievements: Achievement[];
  userAchievements: (UserAchievement & { achievement: Achievement })[];
}

export function AchievementGrid({ allAchievements, userAchievements }: AchievementGridProps) {
  // Create a map of user achievements by achievement ID for quick lookup
  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievementId, ua])
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {allAchievements.map((achievement) => {
        const userAchievement = userAchievementMap.get(achievement.id);
        const isUnlocked = userAchievement?.completed || false;
        const progress = userAchievement?.progress || 0;

        return (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={isUnlocked}
            progress={progress}
            unlockedAt={userAchievement?.unlockedAt}
          />
        );
      })}
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
  unlockedAt?: Date;
}

function AchievementCard({ achievement, isUnlocked, progress, unlockedAt }: AchievementCardProps) {
  // Determine target value from condition
  const condition = achievement.condition as any;
  const target = condition?.target || 100;

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300
        ${isUnlocked
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md hover:shadow-lg'
          : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80'
        }
      `}
    >
      {/* Unlock check mark */}
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md z-10">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Icon */}
      <div className="text-4xl mb-3 text-center">
        {achievement.icon}
      </div>

      {/* Name */}
      <h4 className="font-semibold text-center mb-1 text-sm">
        {achievement.name}
      </h4>

      {/* Description */}
      <p className="text-xs text-gray-600 text-center mb-2 line-clamp-2">
        {achievement.description}
      </p>

      {/* Progress bar for locked achievements */}
      {!isUnlocked && progress > 0 && (
        <div className="mt-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(progress / target) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            {progress}/{target}
          </div>
        </div>
      )}

      {/* Unlock date for unlocked achievements */}
      {isUnlocked && unlockedAt && (
        <div className="text-xs text-gray-500 text-center mt-2">
          {new Date(unlockedAt).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )}

      {/* Experience reward badge */}
      {isUnlocked && achievement.expReward > 0 && (
        <div className="mt-2 flex items-center justify-center">
          <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">
            +{achievement.expReward} EXP
          </div>
        </div>
      )}
    </div>
  );
}
