/**
 * Fu Jiajun V2.1 Training System - Main Page
 *
 * Complete training system interface for Level 4-8 skill development.
 * Implements hierarchical training structure with progress tracking.
 *
 * Features:
 * - Level 4-8 training path with nested organization
 * - Real-time progress tracking and XP rewards
 * - Interactive training unit cards with expandable content
 * - Statistics dashboard with aggregate metrics
 * - Responsive design with skeleton loaders
 * - Error handling and retry mechanisms
 * - Toast notifications for user feedback
 *
 * Architecture:
 * - LevelAccordion → Skills → SubSkillGroup → TrainingUnitCard
 * - TanStack Query for data fetching and mutations
 * - Optimistic UI updates with automatic cache invalidation
 *
 * @module fu-training
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Star,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  useTrainingPath,
  useUpdateProgress,
  useTrainingPathStats,
} from '@/hooks/useFuTraining';
import { LevelAccordion } from '@/components/LevelAccordion';

// ============================================================================
// Main Component
// ============================================================================

export default function FuTraining() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch training path data
  const {
    data: trainingPathData,
    isLoading,
    error,
    refetch,
  } = useTrainingPath();

  // Update progress mutation
  const { mutate: updateProgress, isPending: isUpdating } = useUpdateProgress();

  // Calculate statistics
  const stats = useTrainingPathStats(trainingPathData);

  // State for expanded levels (default: expand first incomplete level)
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([4]));

  /**
   * Handle unit status change
   * Updates progress and shows toast notification
   */
  const handleUnitStatusChange = (
    unitId: string,
    status: 'not_started' | 'in_progress' | 'completed'
  ) => {
    updateProgress(
      { unitId, status },
      {
        onSuccess: (data) => {
          // Show success toast
          if (status === 'completed') {
            toast({
              title: '训练完成！',
              description: `获得 ${data.xpAwarded} XP`,
              duration: 3000,
            });
          } else if (status === 'in_progress') {
            toast({
              title: '开始训练',
              description: '加油，坚持就是胜利！',
              duration: 2000,
            });
          }
        },
        onError: (error) => {
          toast({
            title: '更新失败',
            description: error.message || '请稍后重试',
            variant: 'destructive',
            duration: 3000,
          });
        },
      }
    );
  };

  /**
   * Toggle level expansion
   */
  const toggleLevelExpansion = (levelNumber: number) => {
    setExpandedLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(levelNumber)) {
        newSet.delete(levelNumber);
      } else {
        newSet.add(levelNumber);
      }
      return newSet;
    });
  };

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Levels Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-48" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>加载失败</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              无法加载训练数据，请检查网络连接后重试。
            </p>
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                {error.message || '未知错误'}
              </AlertDescription>
            </Alert>
            <Button onClick={() => refetch()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              重新加载
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // Main Content
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Fu Jiajun 系统训练
              </h1>
              <p className="text-muted-foreground mt-1">
                Level 4-8 进阶训练路径 · 科学提升台球技能
              </p>
            </div>
          </div>

          {/* Welcome Message */}
          {user && (
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200">
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700">
                  欢迎回来，<span className="font-semibold">{user.firstName || '训练者'}</span>！
                  继续你的训练之旅，每一次练习都是进步的积累。
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {/* Total Units */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">训练单元</p>
                  <p className="text-3xl font-bold">{stats.totalUnits}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">完成率</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.completionPercentage}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.completedUnits} / {stats.totalUnits} 已完成
              </div>
            </CardContent>
          </Card>

          {/* Total XP */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">经验值</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.totalXpEarned}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                / {stats.totalXpAvailable} XP 可获得
              </div>
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">进行中</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.inProgressUnits}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.notStartedUnits} 待开始
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Level Statistics Summary */}
        {stats.levelStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  各级别进度概览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {stats.levelStats.map((levelStat) => (
                    <div
                      key={levelStat.levelNumber}
                      className="flex flex-col gap-2 p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => toggleLevelExpansion(levelStat.levelNumber)}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-semibold">
                          Level {levelStat.levelNumber}
                        </Badge>
                        <span className="text-sm font-medium text-green-600">
                          {levelStat.completionPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {levelStat.levelTitle}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {levelStat.completed}/{levelStat.totalUnits} 单元
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Training Levels */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {trainingPathData?.levels && trainingPathData.levels.length > 0 ? (
            trainingPathData.levels.map((level) => (
              <LevelAccordion
                key={level.id}
                level={level}
                onUnitStatusChange={handleUnitStatusChange}
                defaultExpanded={expandedLevels.has(level.levelNumber)}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">暂无训练内容</h3>
                <p className="text-muted-foreground">
                  训练内容正在准备中，请稍后再来。
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Loading Overlay */}
        {isUpdating && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                <p className="font-medium">更新中...</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
