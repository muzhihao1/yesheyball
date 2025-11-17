import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Target, Calendar, TrendingUp, Award, Rocket } from 'lucide-react';

/**
 * Welcome Modal Component
 *
 * First-time user onboarding modal for 90-day challenge
 *
 * Features:
 * - Introduction to the challenge
 * - Key features explanation
 * - Motivation and goals
 * - Start challenge button
 *
 * Props:
 * - open: Whether modal is visible
 * - onOpenChange: Handler when modal open state changes (for closing)
 * - onStart: Handler to initialize challenge
 * - isStarting: Loading state during initialization
 */

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
  isStarting?: boolean;
}

export default function WelcomeModal({ open, onOpenChange, onStart, isStarting }: WelcomeModalProps) {
  const features = [
    {
      icon: Target,
      title: '五维能力评分',
      description: '准度、杆法、走位、发力、策略全面评估',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Calendar,
      title: '系统化训练',
      description: '90天结构化课程，循序渐进提升',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: '进度追踪',
      description: '实时记录训练数据，可视化进步曲线',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Award,
      title: '难度加权',
      description: '初级、中级、高级训练获得不同分数',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="py-6 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
              欢迎来到90天台球挑战
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              通过系统化训练和科学的能力评分系统，让你在90天内成为更强大的球手
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-10 shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Info Box */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl"
          >
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              挑战目标
            </h3>
            <div className="space-y-2 text-blue-800 dark:text-blue-200">
              <p className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>完成90天系统化训练课程，每天坚持训练</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>通过五维能力分系统，全面提升台球技术</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>从初级到高级，难度递增，稳步进阶</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>记录每次训练数据，见证自己的进步</span>
              </p>
            </div>
          </motion.div>

          {/* Motivational Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <p className="text-xl font-medium text-foreground italic">
              "成功的秘诀在于持之以恒的努力"
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              - 三个月一杆清台
            </p>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Button
              onClick={onStart}
              disabled={isStarting}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg py-6"
            >
              {isStarting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  正在初始化...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  开始90天挑战
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-3">
              点击开始后，系统将为您记录挑战开始日期
            </p>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
