/**
 * TrainingUnitModal Component
 *
 * Displays full training unit content and handles completion workflow.
 * Supports three unit types: theory, practice, challenge.
 */

import { memo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Target,
  Zap,
  Play,
  Pause,
  CheckCircle,
  Star,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { useCompleteTrainingUnit, type TrainingUnitV3 } from '@/hooks/useSkillsV3';

interface TrainingUnitModalProps {
  unit: TrainingUnitV3 | null;
  isOpen: boolean;
  onClose: () => void;
}

function TrainingUnitModal({ unit, isOpen, onClose }: TrainingUnitModalProps) {
  const { toast } = useToast();
  const completeUnitMutation = useCompleteTrainingUnit();

  // State for practice/challenge sessions
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [score, setScore] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Reset state when unit changes
  useEffect(() => {
    if (unit) {
      setIsTimerRunning(false);
      setElapsedSeconds(0);
      setScore(undefined);
      setNotes('');
      setShowCompletionForm(false);
    }
  }, [unit?.id]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle unit completion
  const handleComplete = async () => {
    if (!unit) return;

    try {
      await completeUnitMutation.mutateAsync({
        unitId: unit.id,
        score,
        notes: notes || undefined,
      });

      toast({
        title: '训练完成！',
        description: `恭喜完成 ${unit.title}，获得 ${unit.xpReward} XP！`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: '完成失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // Handle theory unit completion (simple read confirmation)
  const handleTheoryComplete = async () => {
    if (!unit) return;

    try {
      await completeUnitMutation.mutateAsync({
        unitId: unit.id,
      });

      toast({
        title: '理论学习完成！',
        description: `获得 ${unit.xpReward} XP！`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: '完成失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // Handle practice/challenge completion flow
  const handleFinish = () => {
    setIsTimerRunning(false);
    setShowCompletionForm(true);
  };

  // Get unit type theme
  const getUnitTheme = () => {
    if (!unit) return { bg: 'bg-gray-50', icon: 'text-gray-500', badge: 'bg-gray-500' };

    switch (unit.unitType) {
      case 'theory':
        return { bg: 'bg-blue-50', icon: 'text-blue-500', badge: 'bg-blue-500' };
      case 'practice':
        return { bg: 'bg-green-50', icon: 'text-green-500', badge: 'bg-green-500' };
      case 'challenge':
        return { bg: 'bg-orange-50', icon: 'text-orange-500', badge: 'bg-orange-500' };
      default:
        return { bg: 'bg-gray-50', icon: 'text-gray-500', badge: 'bg-gray-500' };
    }
  };

  // Get unit type icon
  const getUnitIcon = () => {
    if (!unit) return <Target className="w-6 h-6" />;

    switch (unit.unitType) {
      case 'theory':
        return <BookOpen className="w-6 h-6" />;
      case 'practice':
        return <Target className="w-6 h-6" />;
      case 'challenge':
        return <Zap className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
    }
  };

  // Get unit type label
  const getUnitTypeLabel = () => {
    if (!unit) return '单元';

    switch (unit.unitType) {
      case 'theory':
        return '理论';
      case 'practice':
        return '练习';
      case 'challenge':
        return '挑战';
      default:
        return '单元';
    }
  };

  if (!unit) {
    return null;
  }

  const theme = getUnitTheme();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className={theme.icon}>{getUnitIcon()}</div>
            <span>{unit.title}</span>
            <Badge className={`${theme.badge} text-white`}>{getUnitTypeLabel()}</Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center space-x-4 text-sm">
            {unit.estimatedMinutes && (
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                预计 {unit.estimatedMinutes} 分钟
              </span>
            )}
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              +{unit.xpReward} XP
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Unit Content */}
        <div className="space-y-6 mt-4">
          {/* THEORY UNIT CONTENT */}
          {unit.unitType === 'theory' && (
            <>
              {/* Theory Text Content */}
              {unit.content?.text && (
                <div className={`${theme.bg} border-l-4 border-blue-500 p-6 rounded-r-lg`}>
                  <h3 className="font-bold text-blue-700 mb-3">理论内容</h3>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {unit.content.text}
                  </div>
                </div>
              )}

              {/* Theory Image */}
              {unit.content?.image && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={unit.content.image}
                    alt={unit.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Key Points */}
              {unit.content?.keyPoints && unit.content.keyPoints.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                  <h3 className="font-bold text-yellow-700 mb-3">关键要点</h3>
                  <ul className="space-y-2">
                    {unit.content.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="text-yellow-500 mr-2 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Theory Completion Button */}
              <div className="flex justify-center pt-6">
                <Button
                  onClick={handleTheoryComplete}
                  disabled={completeUnitMutation.isPending}
                  className="bg-blue-500 hover:bg-blue-600 px-8 py-6 text-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {completeUnitMutation.isPending ? '保存中...' : '我已阅读完毕'}
                </Button>
              </div>
            </>
          )}

          {/* PRACTICE UNIT CONTENT */}
          {unit.unitType === 'practice' && (
            <>
              {/* Practice Description */}
              {unit.goalDescription && (
                <div className={`${theme.bg} border-l-4 border-green-500 p-6 rounded-r-lg`}>
                  <h3 className="font-bold text-green-700 mb-3">练习说明</h3>
                  <p className="text-gray-700">{unit.goalDescription}</p>
                </div>
              )}

              {/* Practice Steps */}
              {unit.content?.keyPoints && unit.content.keyPoints.length > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <h3 className="font-bold text-blue-700 mb-3">练习步骤</h3>
                  <ol className="space-y-2">
                    {unit.content.keyPoints.map((step, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Practice Image/Video */}
              {unit.content?.image && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={unit.content.image}
                    alt={unit.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Timer Section */}
              {!showCompletionForm && (
                <div className="bg-gray-50 rounded-lg p-8 border">
                  <div className="text-center space-y-6">
                    {/* Timer Display */}
                    <div>
                      <div className="text-sm text-gray-600 mb-2">练习用时</div>
                      <div className="text-5xl font-mono font-bold text-gray-800">
                        {formatTime(elapsedSeconds)}
                      </div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex justify-center gap-4">
                      {!isTimerRunning && elapsedSeconds === 0 ? (
                        <Button
                          onClick={() => setIsTimerRunning(true)}
                          className="bg-green-500 hover:bg-green-600 px-8 py-6 text-lg"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          开始练习
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            variant="outline"
                            className="px-6 py-6"
                          >
                            {isTimerRunning ? (
                              <>
                                <Pause className="w-5 h-5 mr-2" />
                                暂停
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 mr-2" />
                                继续
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setElapsedSeconds(0);
                              setIsTimerRunning(false);
                            }}
                            variant="outline"
                            className="px-6 py-6"
                          >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            重置
                          </Button>
                          <Button
                            onClick={handleFinish}
                            className="bg-green-500 hover:bg-green-600 px-8 py-6"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            完成练习
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Form */}
              {showCompletionForm && (
                <div className="space-y-6 border rounded-lg p-6 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-800">完成评估</h3>

                  {/* Practice Time */}
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">练习用时</div>
                    <div className="text-3xl font-mono font-bold text-gray-800">
                      {formatTime(elapsedSeconds)}
                    </div>
                  </div>

                  {/* Self Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      练习评分 (可选)
                    </label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setScore(rating * 20)}
                          className={`p-3 rounded-lg transition-all ${
                            score === rating * 20
                              ? 'bg-yellow-400 text-white scale-110'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          <Star
                            className="w-8 h-8"
                            fill={score && score >= rating * 20 ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      练习笔记 (可选)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="记录你的练习心得、遇到的问题或改进思路..."
                      rows={4}
                      className="w-full"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      onClick={() => setShowCompletionForm(false)}
                      variant="outline"
                    >
                      继续练习
                    </Button>
                    <Button
                      onClick={handleComplete}
                      disabled={completeUnitMutation.isPending}
                      className="bg-green-500 hover:bg-green-600 px-8"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {completeUnitMutation.isPending ? '提交中...' : '确认完成'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CHALLENGE UNIT CONTENT */}
          {unit.unitType === 'challenge' && (
            <>
              {/* Challenge Requirements */}
              {unit.goalDescription && (
                <div className={`${theme.bg} border-l-4 border-orange-500 p-6 rounded-r-lg`}>
                  <h3 className="font-bold text-orange-700 mb-3">挑战要求</h3>
                  <p className="text-gray-700">{unit.goalDescription}</p>
                </div>
              )}

              {/* Challenge Details */}
              {unit.content?.text && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <h3 className="font-bold text-blue-700 mb-3">挑战说明</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{unit.content.text}</p>
                </div>
              )}

              {/* Challenge Video/Image */}
              {unit.content?.video ? (
                <div className="rounded-lg overflow-hidden border bg-black">
                  <video
                    src={unit.content.video}
                    controls
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : unit.content?.image ? (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={unit.content.image}
                    alt={unit.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : null}

              {/* Challenge Timer/Countdown */}
              {!showCompletionForm && (
                <div className="bg-orange-50 rounded-lg p-8 border border-orange-200">
                  <div className="text-center space-y-6">
                    <div>
                      <div className="text-sm text-orange-700 mb-2">挑战计时</div>
                      <div className="text-5xl font-mono font-bold text-orange-600">
                        {formatTime(elapsedSeconds)}
                      </div>
                    </div>

                    <div className="flex justify-center gap-4">
                      {!isTimerRunning && elapsedSeconds === 0 ? (
                        <Button
                          onClick={() => setIsTimerRunning(true)}
                          className="bg-orange-500 hover:bg-orange-600 px-8 py-6 text-lg"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          开始挑战
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            variant="outline"
                            className="px-6 py-6"
                          >
                            {isTimerRunning ? (
                              <>
                                <Pause className="w-5 h-5 mr-2" />
                                暂停
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 mr-2" />
                                继续
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleFinish}
                            className="bg-orange-500 hover:bg-orange-600 px-8 py-6"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            提交成绩
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Challenge Completion Form */}
              {showCompletionForm && (
                <div className="space-y-6 border rounded-lg p-6 bg-orange-50">
                  <h3 className="text-lg font-bold text-gray-800">挑战成绩</h3>

                  {/* Challenge Time */}
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">挑战用时</div>
                    <div className="text-3xl font-mono font-bold text-orange-600">
                      {formatTime(elapsedSeconds)}
                    </div>
                  </div>

                  {/* Score Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      自评成绩 (0-100分)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={score || ''}
                      onChange={(e) => setScore(Number(e.target.value))}
                      placeholder="输入成绩"
                      className="w-full px-4 py-3 text-2xl font-bold text-center border-2 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      挑战总结 (可选)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="记录挑战过程中的表现、难点和收获..."
                      rows={4}
                      className="w-full"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-center gap-4 pt-4">
                    <Button
                      onClick={() => {
                        setShowCompletionForm(false);
                        setElapsedSeconds(0);
                      }}
                      variant="outline"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      重新挑战
                    </Button>
                    <Button
                      onClick={handleComplete}
                      disabled={completeUnitMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 px-8"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {completeUnitMutation.isPending ? '提交中...' : '确认提交'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(TrainingUnitModal);
