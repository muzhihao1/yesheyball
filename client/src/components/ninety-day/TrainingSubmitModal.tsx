/**
 * Training Submit Modal Component
 * Modal for submitting training records for a specific day in the 90-day challenge
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SubmitNinetyDayTrainingRecord } from '@shared/schema';
import { submitNinetyDayTrainingRecordSchema } from '@shared/schema';
import { useSubmitTraining } from '@/hooks/useSubmitTraining';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TrainingSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  onSubmitSuccess?: () => void;
}

const TRAINING_TYPES = [
  { value: '系统', label: '系统训练' },
  { value: '自由', label: '自由训练' },
  { value: '特殊', label: '特殊训练' },
] as const;

const FOCUS_AREAS = ['准度', '走位', '杆法', '发力', '策略'] as const;

export function TrainingSubmitModal({
  isOpen,
  onClose,
  dayNumber,
  onSubmitSuccess,
}: TrainingSubmitModalProps) {
  const { toast } = useToast();
  const submitMutation = useSubmitTraining();
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<Array<typeof FOCUS_AREAS[number]>>([]);

  const form = useForm<SubmitNinetyDayTrainingRecord>({
    resolver: zodResolver(submitNinetyDayTrainingRecordSchema),
    defaultValues: {
      dayNumber,
      trainingType: '系统',
      durationMinutes: 30,
      notes: '',
      trainingStats: {
        shotsAttempted: undefined,
        shotsSuccessful: undefined,
        focusAreas: [],
      },
      achievedTarget: false,
    },
  });

  const onSubmit = async (data: SubmitNinetyDayTrainingRecord) => {
    // Add selected focus areas to training stats
    const submissionData = {
      ...data,
      trainingStats: {
        ...data.trainingStats,
        focusAreas: selectedFocusAreas.length > 0 ? selectedFocusAreas : undefined,
      },
    };

    submitMutation.mutate(submissionData, {
      onSuccess: (response) => {
        const successRate = response.data.successRate;
        const stars = successRate !== null && successRate >= 90 ? 5 :
                      successRate !== null && successRate >= 70 ? 4 :
                      successRate !== null && successRate >= 50 ? 3 :
                      successRate !== null && successRate >= 30 ? 2 : 1;

        // Format score changes for display
        const scoreChanges = response.data.scoreChanges || {};
        const abilityLabels: Record<string, string> = {
          accuracy: '准度',
          spin: '杆法',
          positioning: '走位',
          power: '发力',
          strategy: '策略',
          clearance: '清台能力',
        };

        // Build score changes text
        const scoreChangesList = Object.entries(scoreChanges)
          .filter(([key, value]) => key !== 'clearance' && value > 0)
          .map(([key, value]) => `${abilityLabels[key]}+${value}`)
          .join('、');

        const clearanceBonus = scoreChanges.clearance || 0;

        toast({
          title: '训练记录提交成功！',
          description: successRate !== null
            ? `成功率：${successRate}%，获得 ${stars} 星评价\n${scoreChangesList ? `能力提升：${scoreChangesList}` : ''}\n清台能力总分 +${clearanceBonus}`
            : `记录已保存${scoreChangesList ? `\n能力提升：${scoreChangesList}` : ''}\n清台能力总分 +${clearanceBonus}`,
        });

        onSubmitSuccess?.();
        onClose();
        form.reset();
        setSelectedFocusAreas([]);
      },
      onError: (error) => {
        toast({
          title: '提交失败',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleFocusAreaToggle = (area: typeof FOCUS_AREAS[number]) => {
    setSelectedFocusAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            第 {dayNumber} 天训练记录
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Training Type and Duration Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trainingType">训练类型 *</Label>
              <Select
                value={form.watch('trainingType')}
                onValueChange={(value) => form.setValue('trainingType', value as '系统' | '自由' | '特殊')}
              >
                <SelectTrigger id="trainingType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.trainingType && (
                <p className="text-sm text-destructive">{form.formState.errors.trainingType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">训练时长（分钟）*</Label>
              <Input
                id="durationMinutes"
                type="number"
                min={1}
                max={300}
                {...form.register('durationMinutes', { valueAsNumber: true })}
                placeholder="例如: 45"
              />
              {form.formState.errors.durationMinutes && (
                <p className="text-sm text-destructive">{form.formState.errors.durationMinutes.message}</p>
              )}
            </div>
          </div>

          {/* Training Statistics Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shotsAttempted">尝试球数</Label>
              <Input
                id="shotsAttempted"
                type="number"
                min={0}
                {...form.register('trainingStats.shotsAttempted', { valueAsNumber: true })}
                placeholder="例如: 50"
              />
              {form.formState.errors.trainingStats?.shotsAttempted && (
                <p className="text-sm text-destructive">{form.formState.errors.trainingStats.shotsAttempted.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shotsSuccessful">成功球数</Label>
              <Input
                id="shotsSuccessful"
                type="number"
                min={0}
                {...form.register('trainingStats.shotsSuccessful', { valueAsNumber: true })}
                placeholder="例如: 35"
              />
              {form.formState.errors.trainingStats?.shotsSuccessful && (
                <p className="text-sm text-destructive">{form.formState.errors.trainingStats.shotsSuccessful.message}</p>
              )}
            </div>
          </div>

          {form.formState.errors.trainingStats?.root && (
            <p className="text-sm text-destructive">{form.formState.errors.trainingStats.root.message}</p>
          )}

          {/* Focus Areas */}
          <div className="space-y-3">
            <Label>训练焦点</Label>
            <div className="flex flex-wrap gap-3">
              {FOCUS_AREAS.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={`focus-${area}`}
                    checked={selectedFocusAreas.includes(area)}
                    onCheckedChange={() => handleFocusAreaToggle(area)}
                  />
                  <Label
                    htmlFor={`focus-${area}`}
                    className="font-normal cursor-pointer"
                  >
                    {area}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">训练笔记</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="记录今天的训练心得、遇到的问题或突破..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {form.watch('notes')?.length || 0} / 1000
            </p>
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">{form.formState.errors.notes.message}</p>
            )}
          </div>

          {/* Achieved Target */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="achievedTarget"
              checked={form.watch('achievedTarget')}
              onCheckedChange={(checked) => form.setValue('achievedTarget', checked as boolean)}
            />
            <Label
              htmlFor="achievedTarget"
              className="text-base font-medium cursor-pointer"
            >
              达成今日训练目标
            </Label>
          </div>
          {form.formState.errors.achievedTarget && (
            <p className="text-sm text-destructive">{form.formState.errors.achievedTarget.message}</p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitMutation.isPending}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              提交训练记录
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
