/**
 * Challenge Hero Component
 *
 * Hero section for the 90-day challenge page with:
 * - Value proposition and social proof
 * - Milestone progress roadmap (3 stages)
 * - "How to Start" 3-step guide
 * - CTA buttons
 *
 * Design Goals:
 * - 3-second value recognition
 * - 10-second action path clarity
 * - Visual engagement with billiards theme
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, CheckCircle, BookOpen, TrendingUp, Trophy } from 'lucide-react';
import { DAILY_TRAINING_CONFIG } from '@/constants/training';

interface ChallengeHeroProps {
  currentDay: number;
  completedDays: number;
  clearanceScore: number;
  onStartTraining: () => void;
  /**
   * 用户状态：'new' | 'active' | 'completed'
   * - 'new': 新用户，未完成onboarding
   * - 'active': 活跃用户，有计划且未完成
   * - 'completed': 完成用户，计划已完成或90天结束
   */
  userStatus?: 'new' | 'active' | 'completed';
}

export function ChallengeHero({
  currentDay,
  completedDays,
  clearanceScore,
  onStartTraining,
  userStatus = 'new',
}: ChallengeHeroProps) {
  // Calculate which stage user is in (1-30: Basic, 31-60: Advanced, 61-90: Mastery)
  const getCurrentStage = () => {
    if (currentDay <= 30) return { stage: 1, name: '基础阶段', color: 'from-green-500 to-emerald-500' };
    if (currentDay <= 60) return { stage: 2, name: '进阶阶段', color: 'from-blue-500 to-indigo-500' };
    return { stage: 3, name: '实战阶段', color: 'from-purple-500 to-pink-500' };
  };

  const stage = getCurrentStage();
  const daysRemaining = 90 - currentDay + 1;
  const progressPercentage = Math.round((currentDay / 90) * 100);

  // Milestone roadmap data
  const milestones = [
    {
      stage: 1,
      name: '基础阶段',
      days: '1-30 天',
      color: 'bg-green-500',
      description: '掌握基本功',
      isActive: currentDay <= 30,
      isCompleted: currentDay > 30,
    },
    {
      stage: 2,
      name: '进阶阶段',
      days: '31-60 天',
      color: 'bg-blue-500',
      description: '技术提升',
      isActive: currentDay > 30 && currentDay <= 60,
      isCompleted: currentDay > 60,
    },
    {
      stage: 3,
      name: '实战阶段',
      days: '61-90 天',
      color: 'bg-purple-500',
      description: '清台挑战',
      isActive: currentDay > 60,
      isCompleted: false,
    },
  ];

  /**
   * 条件化 steps 数组：根据用户状态显示不同的引导步骤
   *
   * 'new' 用户：显示完整的新手引导流程（水平测试 → 获取计划）
   * 'active' 用户：隐藏（用户已完成onboarding，应专注于每日训练）
   * 'completed' 用户：隐藏（在首页不显示，但可在Settings中提供重新开始选项）
   */
  const steps = userStatus === 'new'
    ? [
        {
          icon: <Target className="w-6 h-6" />,
          title: '水平测试',
          description: '3 分钟了解您的水平',
          link: '/onboarding',
          linkText: '去测试',
        },
        {
          icon: <BookOpen className="w-6 h-6" />,
          title: '获取计划',
          description: '量身定制训练路线',
          link: '#',
          linkText: '查看计划',
          isDisabled: true,
        },
      ]
    : []; // 'active' 和 'completed' 用户：不显示步骤

  return (
    <section className="relative overflow-hidden">
      {/* Background with billiards theme gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50 dark:from-emerald-950 dark:via-green-950 dark:to-amber-950">
        {/* Decorative circles (billiard balls) */}
        <div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Headline */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-emerald-600 to-amber-600">
                用 90 天，从新手到一杆清台
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {DAILY_TRAINING_CONFIG.homeSubtitle}
            </p>
          </div>

          {/* Milestone Roadmap */}
          <Card className="mb-8 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  您的 90 天成长路线
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  还剩 <span className="font-bold text-green-600">{daysRemaining}</span> 天
                </div>
              </div>

              {/* Progress Bar with Stages */}
              <div className="relative mb-6">
                {/* Background track */}
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-500`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Milestone markers */}
                <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1">
                  {[0, 30, 60, 90].map((day, index) => (
                    <div
                      key={day}
                      className="relative flex flex-col items-center"
                      style={{ left: `${(day / 90) * 100}%` }}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          currentDay >= day
                            ? 'bg-white border-green-600'
                            : 'bg-gray-300 border-gray-400'
                        } -mt-0.5`}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        {day === 0 ? '开始' : `${day}天`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.stage}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      milestone.isActive
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                        : milestone.isCompleted
                        ? 'border-gray-300 bg-gray-100 dark:bg-gray-800'
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                          {milestone.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {milestone.days}
                        </p>
                      </div>
                      {milestone.isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {milestone.isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {milestone.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Current Status */}
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      第 {currentDay} 天
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      当前进度
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {stage.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      当前阶段
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">
                      {clearanceScore}/500
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      清台能力
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* How to Start - 2 Steps (仅新用户显示) */}
          {steps.length > 0 && (
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                如何开始您的清台之旅？
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="relative flex flex-col items-center text-center"
                  >
                    {/* Step number badge */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4 shadow-md">
                      {step.icon}
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {step.title}
                    </h4>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {step.description}
                    </p>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      className={`border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 ${
                        step.isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={step.isDisabled}
                      onClick={() => {
                        if (!step.isDisabled && step.link !== '#') {
                          window.location.href = step.link;
                        }
                      }}
                    >
                      {step.linkText}
                    </Button>

                    {/* Connector arrow (not for last step) */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 -right-12 text-gray-400">
                        →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
          )}

          {/* CTA Section */}
          <div className="mt-8 text-center">
            <Button
              onClick={onStartTraining}
              size="lg"
              className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white font-bold py-6 px-12 text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 rounded-2xl"
            >
              <Trophy className="w-6 h-6 mr-2" />
              立即开始今日训练
            </Button>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {DAILY_TRAINING_CONFIG.heroDescription}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
