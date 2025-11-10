/**
 * Skill Detail Modal Component
 * Displays detailed information about a skill with unlock functionality
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface SkillCondition {
  id: number;
  type: string;
  description: string;
  value: string;
  currentProgress: number;
  isMet: boolean;
}

interface SkillDependency {
  skillId: number;
  name: string;
  isUnlocked: boolean;
}

interface SkillData {
  id: number;
  label: string;
  description: string;
  icon: string;
  color: string;
  level: number;
  isUnlocked: boolean;
  canUnlock: boolean;
  conditions?: SkillCondition[];
  dependencies?: SkillDependency[];
}

interface SkillDetailModalProps {
  skill: SkillData | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component for displaying skill details and unlock functionality
 */
export default function SkillDetailModal({
  skill,
  isOpen,
  onClose,
}: SkillDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Unlock skill mutation
  const unlockMutation = useMutation({
    mutationFn: async (skillId: number) => {
      const response = await fetch(`/api/skills/${skillId}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ context: { triggeredBy: 'manual' } }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '解锁失败');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: '🎉 技能解锁成功！',
        description: data.data.rewards?.message || '恭喜解锁新技能！',
      });

      // Invalidate and refetch skill tree data
      queryClient.invalidateQueries({ queryKey: ['/api/skill-tree'] });

      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: '❌ 解锁失败',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (!skill) return null;

  const handleUnlock = () => {
    if (!skill.canUnlock) {
      toast({
        title: '⚠️ 无法解锁',
        description: '请先满足所有解锁条件',
        variant: 'destructive',
      });
      return;
    }

    unlockMutation.mutate(skill.id);
  };

  // Calculate overall progress
  const totalConditions = (skill.conditions?.length || 0) + (skill.dependencies?.length || 0);
  const metConditions =
    (skill.conditions?.filter((c) => c.isMet).length || 0) +
    (skill.dependencies?.filter((d) => d.isUnlocked).length || 0);
  const progressPercentage = totalConditions > 0 ? (metConditions / totalConditions) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            {/* Icon and level badge */}
            <div
              className="text-6xl w-20 h-20 flex items-center justify-center rounded-full"
              style={{ backgroundColor: `${skill.color}20` }}
            >
              {skill.icon}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {skill.label}
                </DialogTitle>
                <div
                  className="px-3 py-1 rounded-full text-white text-sm font-bold"
                  style={{ backgroundColor: skill.color }}
                >
                  L{skill.level}
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                {skill.isUnlocked ? (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <span>✓</span>
                    <span>已解锁</span>
                  </span>
                ) : skill.canUnlock ? (
                  <span className="text-blue-600 font-medium flex items-center gap-1 animate-pulse">
                    <span>🔓</span>
                    <span>可解锁</span>
                  </span>
                ) : (
                  <span className="text-gray-600 font-medium flex items-center gap-1">
                    <span>🔒</span>
                    <span>锁定</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <DialogDescription className="text-base text-gray-700 mt-2">
            {skill.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Overall Progress */}
          {!skill.isUnlocked && totalConditions > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">总体进度</span>
                <span>
                  {metConditions}/{totalConditions} 条件已满足
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          )}

          {/* Dependencies */}
          {skill.dependencies && skill.dependencies.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>📚</span>
                <span>前置技能</span>
              </h3>
              <div className="space-y-2">
                {skill.dependencies.map((dep) => (
                  <div
                    key={dep.skillId}
                    className={`p-3 rounded-lg border-2 ${
                      dep.isUnlocked
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{dep.name}</span>
                      {dep.isUnlocked ? (
                        <span className="text-green-600 font-bold">✓ 已解锁</span>
                      ) : (
                        <span className="text-gray-500 font-medium">🔒 未解锁</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unlock Conditions */}
          {skill.conditions && skill.conditions.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🎯</span>
                <span>解锁条件</span>
              </h3>
              <div className="space-y-3">
                {skill.conditions.map((condition) => {
                  const targetValue = parseInt(condition.value);
                  const progress = (condition.currentProgress / targetValue) * 100;

                  return (
                    <div
                      key={condition.id}
                      className={`p-4 rounded-lg border-2 ${
                        condition.isMet
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {condition.description}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            类型: {getConditionTypeLabel(condition.type)}
                          </p>
                        </div>
                        {condition.isMet ? (
                          <span className="text-green-600 font-bold text-lg">✓</span>
                        ) : (
                          <span className="text-gray-400 font-bold text-lg">○</span>
                        )}
                      </div>

                      {/* Progress bar for incomplete conditions */}
                      {!condition.isMet && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>当前进度</span>
                            <span>
                              {condition.currentProgress}/{targetValue}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unlock Button */}
          {!skill.isUnlocked && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleUnlock}
                disabled={!skill.canUnlock || unlockMutation.isPending}
                className="w-full py-6 text-lg font-bold"
                variant={skill.canUnlock ? 'default' : 'secondary'}
              >
                {unlockMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span>解锁中...</span>
                  </span>
                ) : skill.canUnlock ? (
                  <span className="flex items-center gap-2">
                    <span>🔓</span>
                    <span>立即解锁</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>🔒</span>
                    <span>未满足解锁条件</span>
                  </span>
                )}
              </Button>

              {!skill.canUnlock && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  请先完成上述所有条件和前置技能
                </p>
              )}
            </div>
          )}

          {/* Already Unlocked Message */}
          {skill.isUnlocked && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium text-lg">
                🎉 此技能已解锁！继续努力提升其他技能吧！
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper function to get human-readable condition type label
 */
function getConditionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    LEVEL: '等级要求',
    COURSE: '课程完成',
    ACHIEVEMENT: '成就解锁',
    DAILY_GOAL: '每日目标',
  };
  return labels[type] || type;
}
