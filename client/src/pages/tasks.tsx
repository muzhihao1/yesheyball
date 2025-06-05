import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, Play, Pause, Square, Calendar, Star, BookOpen, Plus, Eye, Trash2 } from "lucide-react";

import type { TrainingProgram, TrainingDay } from "@shared/schema";

// Special Training Types
interface SpecialTraining {
  id: string;
  name: string;
  description: string;
  type: 'power' | 'accuracy';
  combinations: TrainingCombination[];
  currentRound: number;
  currentCombination: number;
  totalRounds: number;
}

interface TrainingCombination {
  id: number;
  method: string;
  target: string;
  power: string;
  result?: boolean;
  completed?: boolean;
}

interface TrainingSession {
  id: number;
  userId: number;
  programId?: number;
  type: string;
  startTime: string;
  endTime?: string;
  status: string;
  notes?: string;
  rating?: number;
  aiCoachingFeedback?: string;
}

interface TrainingRecord {
  id: number;
  userId: number;
  sessionId: number;
  type: string;
  title: string;
  duration: number;
  completedAt: string;
  notes?: string;
  rating?: number;
  aiFeedback?: string;
}

export default function Tasks() {
  const { toast } = useToast();
  
  // Training states
  const [isGuidedTraining, setIsGuidedTraining] = useState(false);
  const [isCustomTraining, setIsCustomTraining] = useState(false);
  const [isSpecialTraining, setIsSpecialTraining] = useState(false);
  
  // Timer states
  const [guidedElapsedTime, setGuidedElapsedTime] = useState(0);
  const [customElapsedTime, setCustomElapsedTime] = useState(0);
  const [specialElapsedTime, setSpecialElapsedTime] = useState(0);
  
  // Pause states
  const [isGuidedPaused, setIsGuidedPaused] = useState(false);
  const [isCustomPaused, setIsCustomPaused] = useState(false);
  const [isSpecialPaused, setIsSpecialPaused] = useState(false);
  
  // Notes and session data
  const [guidedTrainingNotes, setGuidedTrainingNotes] = useState("");
  const [customTrainingNotes, setCustomTrainingNotes] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  
  // Special training states
  const [currentSpecialTraining, setCurrentSpecialTraining] = useState<SpecialTraining | null>(null);
  
  // Dialog states
  const [showTrainingComplete, setShowTrainingComplete] = useState(false);
  const [showRecordDetails, setShowRecordDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [completionRating, setCompletionRating] = useState<string>("");
  const [aiCoachingFeedback, setAiCoachingFeedback] = useState("");
  const [showAiFeedback, setShowAiFeedback] = useState(false);

  // Generate power training combinations
  const generatePowerTrainingCombinations = (): TrainingCombination[] => {
    const methods = ['低杆', '中杆', '高杆'];
    const targets = ['上部', '中部', '下部'];
    const powers = ['小力', '中力', '大力'];
    
    const combinations: TrainingCombination[] = [];
    let id = 1;
    
    for (const method of methods) {
      for (const target of targets) {
        for (const power of powers) {
          combinations.push({
            id: id++,
            method,
            target,
            power,
            completed: false
          });
        }
      }
    }
    
    return combinations;
  };

  // Generate accuracy training combinations
  const generateAccuracyTrainingCombinations = (): TrainingCombination[] => {
    const combinations: TrainingCombination[] = [];
    
    for (let i = 1; i <= 30; i++) {
      combinations.push({
        id: i,
        method: '五分点',
        target: '目标球',
        power: '适中',
        completed: false
      });
    }
    
    return combinations;
  };

  // Initialize power training
  const initializePowerTraining = (): SpecialTraining => {
    return {
      id: 'power-training',
      name: '发力特训',
      description: '通过不同打法、打点和力度的组合训练，提升击球技巧和力度控制',
      type: 'power',
      combinations: generatePowerTrainingCombinations(),
      currentRound: 1,
      currentCombination: 0,
      totalRounds: 3
    };
  };

  // Initialize accuracy training
  const initializeAccuracyTraining = (): SpecialTraining => {
    return {
      id: 'accuracy-training',
      name: '准度特训',
      description: '五分点练习：目标球置于中心点，主球放在开球线上，袋口由用户自行安排',
      type: 'accuracy',
      combinations: generateAccuracyTrainingCombinations(),
      currentRound: 1,
      currentCombination: 0,
      totalRounds: 1
    };
  };

  // Get training programs
  const { data: programs = [] } = useQuery<TrainingProgram[]>({
    queryKey: ["/api/training-programs"],
  });

  // Get training days for the main program
  const mainProgram = programs.find(p => p.name === "耶氏台球学院系统教学");
  const { data: trainingDays = [] } = useQuery<TrainingDay[]>({
    queryKey: [`/api/training-programs/${mainProgram?.id}/days`],
    enabled: !!mainProgram?.id,
  });

  // Get current session
  const { data: currentSession } = useQuery<TrainingSession | null>({
    queryKey: ["/api/training-sessions/current"],
  });

  // Get training sessions (history)
  const { data: sessions = [] } = useQuery<TrainingSession[]>({
    queryKey: ["/api/training-sessions"],
  });

  // Get completed training records
  const { data: trainingRecords = [] } = useQuery<TrainingRecord[]>({
    queryKey: ["/api/training-records"],
  });

  // Delete training record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/training-sessions/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      toast({ title: "训练记录已删除" });
    },
    onError: () => {
      toast({ 
        title: "删除失败", 
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async ({ rating, notes }: { rating: number; notes: string }) => {
      const duration = isGuidedTraining ? guidedElapsedTime : 
                      isCustomTraining ? customElapsedTime : 
                      specialElapsedTime;
      
      const sessionType = isGuidedTraining ? "guided" :
                         isCustomTraining ? "custom" :
                         "special";
      
      const title = isGuidedTraining ? `第${currentDay}集：${currentDayTraining?.title || "握杆"}` :
                   isCustomTraining ? "自主训练" :
                   currentSpecialTraining?.name || "特训模式";

      const response = await fetch("/api/training-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: 1,
          title,
          duration,
          rating,
          notes,
          sessionType,
          completed: true,
          programId: isGuidedTraining ? mainProgram?.id : null,
          dayId: isGuidedTraining ? currentDayTraining?.id : null
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to save training session");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-programs/1/days"] });
      
      // Show AI feedback immediately if available
      if (data.aiFeedback) {
        setAiCoachingFeedback(data.aiFeedback);
        setShowAiFeedback(true);
      }
      
      handleCancelTraining();
      toast({ title: "训练记录已保存，已自动进入下一集训练" });
    },
    onError: () => {
      toast({ 
        title: "保存失败", 
        description: "请重试",
        variant: "destructive"
      });
    }
  });

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGuidedTraining && !isGuidedPaused) {
      interval = setInterval(() => {
        setGuidedElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGuidedTraining, isGuidedPaused]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCustomTraining && !isCustomPaused) {
      interval = setInterval(() => {
        setCustomElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCustomTraining, isCustomPaused]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpecialTraining && !isSpecialPaused) {
      interval = setInterval(() => {
        setSpecialElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSpecialTraining, isSpecialPaused]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if any training is active
  const isAnyTrainingActive = isGuidedTraining || isCustomTraining || isSpecialTraining;

  const handleStartTraining = () => {
    if (isAnyTrainingActive) {
      toast({ 
        title: "无法开始训练", 
        description: "请先完成或取消当前训练",
        variant: "destructive"
      });
      return;
    }
    setSelectedSessionType("系统训练");
    setIsGuidedTraining(true);
    setGuidedElapsedTime(0);
    setIsGuidedPaused(false);
  };

  const handleStartCustomTraining = () => {
    if (isAnyTrainingActive) {
      toast({ 
        title: "无法开始训练", 
        description: "请先完成或取消当前训练",
        variant: "destructive"
      });
      return;
    }
    setSelectedSessionType("自主训练");
    setIsCustomTraining(true);
    setCustomElapsedTime(0);
    setIsCustomPaused(false);
  };

  const handleStartSpecialTraining = (type: 'power' | 'accuracy') => {
    if (isAnyTrainingActive) {
      toast({ 
        title: "无法开始训练", 
        description: "请先完成或取消当前训练",
        variant: "destructive"
      });
      return;
    }
    
    const training = type === 'power' ? initializePowerTraining() : initializeAccuracyTraining();
    setCurrentSpecialTraining(training);
    setSelectedSessionType("特训模式");
    setIsSpecialTraining(true);
    setSpecialElapsedTime(0);
    setIsSpecialPaused(false);
  };

  const handlePauseTraining = () => {
    if (isGuidedTraining) {
      setIsGuidedPaused(!isGuidedPaused);
    } else if (isCustomTraining) {
      setIsCustomPaused(!isCustomPaused);
    } else if (isSpecialTraining) {
      setIsSpecialPaused(!isSpecialPaused);
    }
  };

  const handleCancelTraining = () => {
    // Reset all training states
    setIsGuidedTraining(false);
    setIsCustomTraining(false);
    setIsSpecialTraining(false);
    setIsGuidedPaused(false);
    setIsCustomPaused(false);
    setIsSpecialPaused(false);
    setGuidedElapsedTime(0);
    setCustomElapsedTime(0);
    setSpecialElapsedTime(0);
    setGuidedTrainingNotes("");
    setCustomTrainingNotes("");
    setCurrentSpecialTraining(null);
    setSelectedSessionType("");
    
    toast({ 
      title: "训练已取消", 
      description: "已重置所有训练状态" 
    });
  };

  const getDifficultyBadge = (day: number) => {
    if (day <= 17) return { label: "初级", color: "bg-green-100 text-green-800" };
    if (day <= 34) return { label: "中级", color: "bg-yellow-100 text-yellow-800" };
    return { label: "高级", color: "bg-red-100 text-red-800" };
  };

  const currentDay = mainProgram?.currentDay || 1;
  const currentEpisode = `第${currentDay}集`;
  const difficultyBadge = getDifficultyBadge(currentDay);
  
  // Get current day training details
  const currentDayTraining = trainingDays.find(day => day.day === currentDay);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* System Training Section */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle className="text-lg text-green-800">系统训练：{currentEpisode}</CardTitle>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${difficultyBadge.color} text-xs`}>
                {difficultyBadge.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                第{Math.ceil(currentDay / 7)}周
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">第{currentDay}集：{currentDayTraining?.title || "握杆"}</h3>
            <p className="text-gray-600 mb-4">
              {currentDayTraining?.description || `第${currentDay}集训练内容，持续提升台球技能。`}
            </p>
            
            {currentDayTraining && currentDayTraining.objectives && (
              <div className="mb-3">
                <h4 className="font-medium text-sm text-gray-700 mb-2">📋 训练目标</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {currentDayTraining.objectives.map((objective: string, index: number) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {currentDayTraining && currentDayTraining.keyPoints && currentDayTraining.keyPoints.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium text-sm text-gray-700 mb-2">🎯 重点要求</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {currentDayTraining.keyPoints.map((point: string, index: number) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="text-sm text-gray-500 mb-4">
              课程类别：{currentDayTraining?.title || "基础训练"}
              {currentDayTraining?.estimatedDuration && (
                <span className="ml-4">⏱️ 建议时长：{currentDayTraining.estimatedDuration}分钟</span>
              )}
            </div>
          </div>

          {/* Training Controls */}
          <div className="bg-white rounded-lg p-3 sm:p-4 border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="text-xl sm:text-2xl font-mono text-green-600 text-center sm:text-left">
                {formatTime(guidedElapsedTime)}
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {!isGuidedTraining ? (
                  <Button onClick={handleStartTraining} className="bg-green-600 hover:bg-green-700 touch-target h-12 sm:h-auto">
                    <Play className="h-4 w-4 mr-2" />
                    开始训练
                  </Button>
                ) : (
                  <>
                    <Button onClick={handlePauseTraining} variant="outline" className="touch-target h-12 sm:h-auto">
                      {isGuidedPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                      {isGuidedPaused ? "继续" : "暂停"}
                    </Button>
                    <Button onClick={handleCancelTraining} variant="secondary" className="touch-target h-12 sm:h-auto">
                      取消
                    </Button>
                    <Button onClick={() => setShowTrainingComplete(true)} variant="destructive" className="touch-target h-12 sm:h-auto">
                      <Square className="h-4 w-4 mr-2" />
                      结束训练
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isGuidedTraining && (
              <div className="space-y-3">
                <Label htmlFor="notes">训练笔记</Label>
                <Textarea
                  id="notes"
                  placeholder="记录训练感受、技巧心得或遇到的问题..."
                  value={guidedTrainingNotes}
                  onChange={(e) => setGuidedTrainingNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Training Section */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Star className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-lg text-blue-800">自主训练</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <p className="text-gray-600 text-sm">
              自由练习，根据个人需求安排训练内容
            </p>
            
            <div className="bg-white rounded-lg p-4 border-2 border-blue-100">
              <div className="text-3xl font-mono text-blue-600 mb-4">
                {formatTime(customElapsedTime)}
              </div>
              
              {!isCustomTraining ? (
                <Button 
                  onClick={handleStartCustomTraining} 
                  className="bg-blue-600 hover:bg-blue-700 touch-target h-12 w-full rounded-lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  自主训练
                </Button>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={handlePauseTraining} 
                    variant="outline" 
                    className="touch-target h-12 flex-1 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {isCustomPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                    {isCustomPaused ? "继续" : "暂停"}
                  </Button>
                  <Button 
                    onClick={handleCancelTraining}
                    variant="secondary"
                    className="touch-target h-12 flex-1 rounded-lg"
                  >
                    取消
                  </Button>
                  <Button 
                    onClick={() => setShowTrainingComplete(true)} 
                    className="bg-blue-600 hover:bg-blue-700 touch-target h-12 flex-1 rounded-lg"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    完成训练
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {isCustomTraining && (
            <div className="space-y-3 mt-6">
              <Label htmlFor="custom-notes">训练笔记</Label>
              <Textarea
                id="custom-notes"
                placeholder="记录自主训练内容、技巧练习或心得体会..."
                value={customTrainingNotes}
                onChange={(e) => setCustomTrainingNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Training Section */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">特</span>
              </div>
              <h3 className="text-xl font-bold text-purple-800">特训模式</h3>
            </div>
            
            {!isSpecialTraining ? (
              <>
                <p className="text-gray-600 text-sm">
                  重复训练特定技巧组合，提升专项能力
                </p>
                
                {/* Special Training Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Button 
                    onClick={() => handleStartSpecialTraining('power')}
                    className="bg-purple-600 hover:bg-purple-700 touch-target h-16 rounded-lg text-center p-4"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">发力特训</div>
                      <div className="text-xs opacity-90">打法×打点×力度</div>
                      <div className="text-xs opacity-75">81种组合</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleStartSpecialTraining('accuracy')}
                    className="bg-indigo-600 hover:bg-indigo-700 touch-target h-16 rounded-lg text-center p-4"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">准度特训</div>
                      <div className="text-xs opacity-90">五分点练习</div>
                      <div className="text-xs opacity-75">30球练习</div>
                    </div>
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Timer Display */}
                <div className="text-3xl font-mono text-purple-600">
                  {formatTime(specialElapsedTime)}
                </div>
                
                {/* Current Training Display */}
                {currentSpecialTraining && (
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                    <div className="text-lg font-bold text-purple-800 mb-2">
                      {currentSpecialTraining.name}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      {currentSpecialTraining.type === 'accuracy' ? '五分点练习' : `第 ${currentSpecialTraining.currentRound} 轮 / 共 ${currentSpecialTraining.totalRounds} 轮`}
                    </div>
                    
                    {/* Current Combination */}
                    {currentSpecialTraining.combinations[currentSpecialTraining.currentCombination] && (
                      <div className="bg-gray-50 rounded p-3 mb-4">
                        <div className="text-sm font-medium mb-2">
                          {currentSpecialTraining.type === 'accuracy' 
                            ? `第 ${currentSpecialTraining.currentCombination + 1} 球 / 共 30 球`
                            : `组合 ${currentSpecialTraining.currentCombination + 1} / ${currentSpecialTraining.combinations.length}`
                          }
                        </div>
                        <div className="text-lg font-bold">
                          {currentSpecialTraining.type === 'accuracy' 
                            ? '五分点练习 - 用户自选袋口'
                            : `${currentSpecialTraining.combinations[currentSpecialTraining.currentCombination].method} + ${currentSpecialTraining.combinations[currentSpecialTraining.currentCombination].target} + ${currentSpecialTraining.combinations[currentSpecialTraining.currentCombination].power}`
                          }
                        </div>
                      </div>
                    )}
                    
                    {/* Training Controls */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <Button 
                        onClick={handlePauseTraining} 
                        variant="outline" 
                        className="touch-target h-12 rounded-lg"
                      >
                        {isSpecialPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                        {isSpecialPaused ? "继续" : "暂停"}
                      </Button>
                      <Button 
                        onClick={handleCancelTraining}
                        variant="secondary"
                        className="touch-target h-12 rounded-lg"
                      >
                        取消
                      </Button>
                      <Button 
                        onClick={() => setShowTrainingComplete(true)}
                        className="bg-purple-600 hover:bg-purple-700 touch-target h-12 rounded-lg"
                      >
                        完成
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Training Records Section */}
      {trainingRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>训练记录</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trainingRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{record.title}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(record.completedAt).toLocaleDateString('zh-CN')}
                      {record.duration && ` • ${Math.floor(record.duration / 60)}分钟`}
                      {record.rating && (
                        <span className="ml-2">
                          {'⭐'.repeat(record.rating)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowRecordDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("确定要删除这条训练记录吗？")) {
                          deleteRecordMutation.mutate(record.id);
                        }
                      }}
                      disabled={deleteRecordMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Record Details Dialog */}
      <Dialog open={showRecordDetails} onOpenChange={setShowRecordDetails}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>训练记录详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">训练项目</Label>
                <p className="text-gray-700 mt-1">{selectedRecord.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">训练时长</Label>
                  <p className="text-gray-700 mt-1">
                    {selectedRecord.duration ? `${Math.floor(selectedRecord.duration / 60)}分钟` : "未记录"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">训练评分</Label>
                  <p className="text-gray-700 mt-1">
                    {selectedRecord.rating ? '⭐'.repeat(selectedRecord.rating) : "未评分"}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">训练时间</Label>
                <p className="text-gray-700 mt-1">
                  {new Date(selectedRecord.completedAt).toLocaleString('zh-CN')}
                </p>
              </div>
              
              {selectedRecord.notes && (
                <div>
                  <Label className="text-sm font-medium">训练笔记</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {selectedRecord.notes}
                  </div>
                </div>
              )}
              
              {selectedRecord.aiFeedback && (
                <div>
                  <Label className="text-sm font-medium flex items-center space-x-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <span>AI教练反馈</span>
                  </Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    {selectedRecord.aiFeedback}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={() => setShowRecordDetails(false)}
                className="w-full"
              >
                关闭
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Coaching Feedback Dialog */}
      <Dialog open={showAiFeedback} onOpenChange={setShowAiFeedback}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span>教练反馈</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Chat-style AI feedback */}
            <div className="bg-blue-50 rounded-lg p-4 relative">
              <div className="absolute top-3 left-[-8px] w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-blue-50"></div>
              <div className="text-blue-800 text-sm leading-relaxed whitespace-pre-line">
                {aiCoachingFeedback}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              基于你的训练表现，AI教练为你提供个性化建议
            </div>
            
            <Button 
              onClick={() => setShowAiFeedback(false)}
              className="w-full"
            >
              继续训练
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Training Complete Dialog */}
      <Dialog open={showTrainingComplete} onOpenChange={setShowTrainingComplete}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>训练完成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {isGuidedTraining ? formatTime(guidedElapsedTime) : 
                 isCustomTraining ? formatTime(customElapsedTime) : 
                 formatTime(specialElapsedTime)}
              </div>
              <p className="text-gray-600">训练时长</p>
            </div>
            
            <div className="space-y-3">
              <Label>训练评分</Label>
              <Select value={completionRating} onValueChange={setCompletionRating}>
                <SelectTrigger>
                  <SelectValue placeholder="选择训练感受" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 非常满意</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 满意</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 一般</SelectItem>
                  <SelectItem value="2">⭐⭐ 不太满意</SelectItem>
                  <SelectItem value="1">⭐ 不满意</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>训练总结</Label>
              <Textarea
                placeholder="记录本次训练的收获、遇到的问题或心得体会..."
                value={isGuidedTraining ? guidedTrainingNotes : isCustomTraining ? customTrainingNotes : ""}
                onChange={(e) => {
                  if (isGuidedTraining) {
                    setGuidedTrainingNotes(e.target.value);
                  } else if (isCustomTraining) {
                    setCustomTrainingNotes(e.target.value);
                  }
                }}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="text-sm text-blue-800">
                保存后将自动生成AI教练反馈
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowTrainingComplete(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button 
                onClick={() => {
                  if (!completionRating) {
                    toast({ 
                      title: "请选择训练评分", 
                      variant: "destructive" 
                    });
                    return;
                  }
                  
                  const notes = isGuidedTraining ? guidedTrainingNotes : 
                               isCustomTraining ? customTrainingNotes : "";
                  
                  completeSessionMutation.mutate({
                    rating: parseInt(completionRating),
                    notes
                  });
                  
                  setShowTrainingComplete(false);
                  setCompletionRating("");
                }}
                disabled={completeSessionMutation.isPending}
                className="flex-1"
              >
                {completeSessionMutation.isPending ? "保存中..." : "保存记录"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}