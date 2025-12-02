import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface RetestConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * 重新进行水平测试的确认模态框
 *
 * 用途：
 * - 警告用户重新测试的后果（会覆盖现有计划和进度）
 * - 二次确认防止误操作
 * - 清晰表达操作的不可逆性
 *
 * 特点：
 * - 使用警告图标增强视觉强度
 * - 关键信息用红色或加粗显示
 * - 确认按钮文案明确表达操作结果
 */
export function RetestConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: RetestConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <DialogTitle className="text-lg font-bold">确认要重新开始吗？</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* 主要警告信息 */}
          <DialogDescription className="text-base space-y-3">
            <p>重新进行水平测试将会：</p>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3 space-y-2">
              <p className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-1">❌</span>
                <span>
                  <strong className="text-red-700 dark:text-red-400">清空你当前的学习计划</strong>
                  <br />
                  <span className="text-sm text-red-600 dark:text-red-300">现有的 90 天计划将被完全替换</span>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-1">❌</span>
                <span>
                  <strong className="text-red-700 dark:text-red-400">重置你的所有进度</strong>
                  <br />
                  <span className="text-sm text-red-600 dark:text-red-300">已完成的训练记录和成绩将被保留（用于统计），但计划进度会重置</span>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-1">⚠️</span>
                <span>
                  <strong className="text-red-700 dark:text-red-400">此操作无法撤销</strong>
                  <br />
                  <span className="text-sm text-red-600 dark:text-red-300">请确保你真的想要重新开始</span>
                </span>
              </p>
            </div>

            {/* 额外说明 */}
            <p className="text-sm text-gray-600 dark:text-gray-400 pt-2">
              💡 <strong>提示：</strong>重新测试会根据你的最新水平生成一个新的学习计划，帮助你更好地适应当前的技能水平。
            </p>
          </DialogDescription>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          {/* 取消按钮 - 次级按钮 */}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            再想想
          </Button>

          {/* 确认按钮 - 主按钮，明确表达操作后果 */}
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? '处理中...' : '确认并重新测试'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
