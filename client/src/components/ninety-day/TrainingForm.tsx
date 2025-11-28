import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Zap } from 'lucide-react';
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
  // Require minimum duration of 0.1 minutes (6 seconds) to match backend validation
  duration_minutes: z.number().min(0.1, '请使用计时器记录训练时长'),
  notes: z.string().optional(),
});

type CombinedFormData = z.infer<typeof combinedSchema>;

/**
 * Preset configurations for quick data entry
 */
const PRESETS = [
  { total: 10, success: 5, label: "10球/5进", hint: "初学者常见" },
  { total: 20, success: 10, label: "20球/10进", hint: "有基础" },
  { total: 30, success: 20, label: "30球/20进", hint: "中等水平" },
  { total: 50, success: 35, label: "50球/35进", hint: "进阶水平" },
];

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
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [sliderTotal, setSliderTotal] = useState(30);
  const [sliderSuccess, setSliderSuccess] = useState(20);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CombinedFormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      duration_minutes: 0,
      notes: '',
    },
  });

  // Watch form values for real-time validation
  const totalAttempts = watch('total_attempts');
  const successfulShots = watch('successful_shots');

  // Update duration from timer
  const handleDurationChange = (minutes: number) => {
    setDuration(minutes);
    setValue('duration_minutes', minutes, { shouldValidate: true });
  };

  /**
   * Handle preset button click
   * Auto-fills total_attempts and successful_shots
   */
  const handlePresetClick = (index: number, total: number, success: number) => {
    setSelectedPreset(index);
    setValue('total_attempts', total, { shouldValidate: true });
    setValue('successful_shots', success, { shouldValidate: true });
    setSliderTotal(total);
    setSliderSuccess(success);
  };

  /**
   * Handle slider changes (for success_rate type)
   * Syncs slider values with form inputs
   */
  const handleSliderTotalChange = (value: number[]) => {
    const newTotal = value[0];
    setSliderTotal(newTotal);
    setValue('total_attempts', newTotal, { shouldValidate: true });

    // Adjust success if it exceeds new total
    if (sliderSuccess > newTotal) {
      setSliderSuccess(newTotal);
      setValue('successful_shots', newTotal, { shouldValidate: true });
    }
    setSelectedPreset(null); // Clear preset selection
  };

  const handleSliderSuccessChange = (value: number[]) => {
    const newSuccess = value[0];
    setSliderSuccess(newSuccess);
    setValue('successful_shots', newSuccess, { shouldValidate: true });
    setSelectedPreset(null); // Clear preset selection
  };

  const onFormSubmit = (data: CombinedFormData) => {
    // Validate required fields based on scoring method
    if (scoringMethod === 'success_rate') {
      if (!data.total_attempts || data.successful_shots === undefined) {
        toast({
          title: "请填写完整数据",
          description: "总击球次数和成功次数不能为空",
          variant: "destructive",
        });
        return;
      }
      if (data.successful_shots > data.total_attempts) {
        toast({
          title: "数据错误",
          description: "成功次数不能大于总击球次数哦 😊",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (data.completed_count === undefined || !data.target_count) {
        toast({
          title: "请填写完整数据",
          description: "完成数量和目标数量不能为空",
          variant: "destructive",
        });
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

    // Show success toast (will be followed by actual submission)
    toast({
      title: "太棒了！",
      description: "今日训练已提交 🎉",
    });

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
          {/* Preset Buttons */}
          <div>
            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              快速填充（点击自动填写）
            </Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset, index) => (
                <Badge
                  key={index}
                  variant={selectedPreset === index ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-2"
                  onClick={() => handlePresetClick(index, preset.total, preset.success)}
                >
                  <span className="font-medium">{preset.label}</span>
                  <span className="ml-1 text-xs opacity-75">({preset.hint})</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Slider Controls */}
          <div className="space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center justify-between">
                <span>总击球次数</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{sliderTotal}</span>
              </Label>
              <Slider
                value={[sliderTotal]}
                onValueChange={handleSliderTotalChange}
                min={10}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 flex items-center justify-between">
                <span>成功次数</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{sliderSuccess}</span>
              </Label>
              <Slider
                value={[sliderSuccess]}
                onValueChange={handleSliderSuccessChange}
                min={0}
                max={sliderTotal}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>{sliderTotal}</span>
              </div>
            </div>

            {/* Success Rate Display */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">成功率</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round((sliderSuccess / sliderTotal) * 100)}%
              </p>
            </div>
          </div>

          {/* Manual Input Fields (synced with sliders) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_attempts" className="text-sm font-medium">
                总击球次数 * (手动调整)
              </Label>
              <Input
                id="total_attempts"
                type="number"
                {...register('total_attempts', { valueAsNumber: true })}
                placeholder="例如: 50"
                className="mt-1"
                min="1"
                value={sliderTotal}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  handleSliderTotalChange([val]);
                }}
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
                成功次数 * (手动调整)
              </Label>
              <Input
                id="successful_shots"
                type="number"
                {...register('successful_shots', { valueAsNumber: true })}
                placeholder="例如: 35"
                className="mt-1"
                min="0"
                value={sliderSuccess}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  handleSliderSuccessChange([val]);
                }}
              />
              {errors.successful_shots && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.successful_shots.message}
                </p>
              )}
            </div>
          </div>

          {/* Validation Alert */}
          {totalAttempts && successfulShots !== undefined && successfulShots > totalAttempts && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                成功次数不能大于总击球次数哦 😊
              </AlertDescription>
            </Alert>
          )}

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
              💡 <strong>技能训练提示：</strong>记录您实际完成的数量和目标数量。完成度越高，对应技能分提升越多。难度越高，得分权重越大。
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
