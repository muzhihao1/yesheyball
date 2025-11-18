import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import DurationTimer from './DurationTimer';
import type { TrainingSubmissionPayload } from '@/hooks/useNinetyDayTraining';

/**
 * Dynamic Training Form Component
 *
 * Renders different form fields based on scoring method:
 * - success_rate: For accuracy training (total_attempts, successful_shots)
 * - completion: For technique training (completed_count, target_count)
 *
 * Features:
 * - Built-in timer for duration tracking
 * - Zod validation
 * - Real-time validation feedback
 * - Responsive layout
 */

// Combined validation schema with all possible fields
const combinedSchema = z.object({
  // Convert NaN to undefined to handle empty number inputs
  total_attempts: z.preprocess(
    (val) => (typeof val === 'number' && isNaN(val)) ? undefined : val,
    z.number().int().min(1, '总次数必须大于0').optional()
  ),
  successful_shots: z.preprocess(
    (val) => (typeof val === 'number' && isNaN(val)) ? undefined : val,
    z.number().int().min(0, '成功次数不能为负').optional()
  ),
  completed_count: z.preprocess(
    (val) => (typeof val === 'number' && isNaN(val)) ? undefined : val,
    z.number().int().min(0, '完成数量不能为负').optional()
  ),
  target_count: z.preprocess(
    (val) => (typeof val === 'number' && isNaN(val)) ? undefined : val,
    z.number().int().min(1, '目标数量必须大于0').optional()
  ),
  // Allow any duration >= 0, soft warning shown in UI instead of hard validation
  duration_minutes: z.number().min(0, '训练时长不能为负'),
  notes: z.string().optional(),
});

type CombinedFormData = z.infer<typeof combinedSchema>;

interface TrainingFormProps {
  dayNumber: number;
  scoringMethod: 'success_rate' | 'completion';
  difficulty: string;
  onSubmit: (payload: TrainingSubmissionPayload) => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function TrainingForm({
  dayNumber,
  scoringMethod,
  difficulty,
  onSubmit,
  isSubmitting,
  className,
}: TrainingFormProps) {
  const [duration, setDuration] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CombinedFormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      duration_minutes: 0,
      notes: '',
    },
  });

  // Update duration from timer
  const handleDurationChange = (minutes: number) => {
    setDuration(minutes);
    setValue('duration_minutes', minutes, { shouldValidate: true });
  };

  const onFormSubmit = (data: CombinedFormData) => {
    // Validate required fields based on scoring method
    if (scoringMethod === 'success_rate') {
      if (!data.total_attempts || data.successful_shots === undefined) {
        return;
      }
      if (data.successful_shots > data.total_attempts) {
        return;
      }
    } else {
      if (data.completed_count === undefined || !data.target_count) {
        return;
      }
    }

    const payload: TrainingSubmissionPayload = {
      day_number: dayNumber,
      duration_minutes: data.duration_minutes,
      training_stats: scoringMethod === 'success_rate'
        ? {
            total_attempts: data.total_attempts!,
            successful_shots: data.successful_shots!,
            duration_minutes: data.duration_minutes,
          }
        : {
            completed_count: data.completed_count!,
            target_count: data.target_count!,
            duration_minutes: data.duration_minutes,
          },
      notes: data.notes,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={`space-y-6 ${className}`}>
      {/* Duration Timer */}
      <div>
        <Label className="text-base font-semibold mb-3 block">训练时长</Label>
        <DurationTimer onDurationChange={handleDurationChange} />
        {errors.duration_minutes && (
          <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.duration_minutes.message}
          </p>
        )}
      </div>

      {/* Dynamic form fields based on scoring method */}
      {scoringMethod === 'success_rate' ? (
        <>
          {/* Success Rate Form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_attempts" className="text-sm font-medium">
                总击球次数 *
              </Label>
              <Input
                id="total_attempts"
                type="number"
                {...register('total_attempts', { valueAsNumber: true })}
                placeholder="例如: 50"
                className="mt-1"
                min="1"
              />
              {errors.total_attempts && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.total_attempts.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="successful_shots" className="text-sm font-medium">
                成功次数 *
              </Label>
              <Input
                id="successful_shots"
                type="number"
                {...register('successful_shots', { valueAsNumber: true })}
                placeholder="例如: 35"
                className="mt-1"
                min="0"
              />
              {errors.successful_shots && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.successful_shots.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>准度训练提示：</strong>记录您的总击球次数和成功击中目标的次数。成功率越高，准度分提升越多。
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Completion Form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="completed_count" className="text-sm font-medium">
                完成数量 *
              </Label>
              <Input
                id="completed_count"
                type="number"
                {...register('completed_count', { valueAsNumber: true })}
                placeholder="例如: 8"
                className="mt-1"
                min="0"
              />
              {errors.completed_count && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.completed_count.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="target_count" className="text-sm font-medium">
                目标数量 *
              </Label>
              <Input
                id="target_count"
                type="number"
                {...register('target_count', { valueAsNumber: true })}
                placeholder="例如: 10"
                className="mt-1"
                min="1"
              />
              {errors.target_count && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.target_count.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              💡 <strong>技能训练提示：</strong>记录您实际完成的数量和目标数量。完成度越高，对应技能分提升越多。难度越高（{difficulty}），得分权重越大。
            </p>
          </div>
        </>
      )}

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          训练笔记（选填）
        </Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="记录今天训练的感受、遇到的问题或进步..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            提交中...
          </>
        ) : (
          <>提交训练记录</>
        )}
      </Button>

      {duration < 1 && (
        <p className="text-sm text-blue-600 dark:text-blue-400 text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-4 h-4" />
          💡 提示：建议使用计时器记录训练时长，效果更佳
        </p>
      )}
    </form>
  );
}
