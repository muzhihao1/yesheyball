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
import { Clock, Play, Pause, Square, Calendar, Star, BookOpen, Plus, Eye } from "lucide-react";

interface TrainingProgram {
  id: number;
  name: string;
  description: string;
  totalDays: number;
  currentDay?: number;
}

interface TrainingSession {
  id: number;
  userId: number;
  programId: number | null;
  dayId: number | null;
  title: string;
  description: string | null;
  duration: number | null;
  rating: number | null;
  notes: string | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  sessionType: string;
}

interface TrainingRecord {
  id: number;
  userId: number;
  title: string;
  content: string;
  duration: number | null;
  rating: number | null;
  completedAt: Date;
  sessionType: string;
}

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
  technique: string; // 打、点、推 OR 球位描述
  cuePoint: string; // 低杆、中杆、高杆、低杆左塞等 OR 目标袋口
  power: string; // 大力、中力、小力 OR 难度等级
  completed: boolean;
}

export default function Tasks() {
  // Guided training states
  const [isGuidedTraining, setIsGuidedTraining] = useState(false);
  const [isGuidedPaused, setIsGuidedPaused] = useState(false);
  const [guidedElapsedTime, setGuidedElapsedTime] = useState(0);
  const [guidedTrainingNotes, setGuidedTrainingNotes] = useState("");
  
  // Custom training states
  const [isCustomTraining, setIsCustomTraining] = useState(false);
  const [isCustomPaused, setIsCustomPaused] = useState(false);
  const [customElapsedTime, setCustomElapsedTime] = useState(0);
  const [customTrainingNotes, setCustomTrainingNotes] = useState("");
  
  // Special training states
  const [isSpecialTraining, setIsSpecialTraining] = useState(false);
  const [isSpecialPaused, setIsSpecialPaused] = useState(false);
  const [specialElapsedTime, setSpecialElapsedTime] = useState(0);
  const [currentSpecialTraining, setCurrentSpecialTraining] = useState<SpecialTraining | null>(null);
  const [showSpecialTrainingDetail, setShowSpecialTrainingDetail] = useState(false);
  const [specialTrainingNotes, setSpecialTrainingNotes] = useState("");
  const [specialTrainingSessionId, setSpecialTrainingSessionId] = useState<number | null>(null);
  
  // Shared states
  const [showTrainingComplete, setShowTrainingComplete] = useState(false);
  const [showCustomTraining, setShowCustomTraining] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [selectedSessionType, setSelectedSessionType] = useState("系统训练");
  const [coachingFeedback, setCoachingFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const { toast } = useToast();

  // Generate power training combinations
  const generatePowerTrainingCombinations = (): TrainingCombination[] => {
    const techniques = ['打', '点', '推'];
    const cuePoints = [
      '低杆', '中杆', '高杆',
      '低杆左塞', '低杆右塞',
      '中杆左塞', '中杆右塞',
      '高杆左塞', '高杆右塞'
    ];
    const powers = ['大力', '中力', '小力'];
    
    const combinations: TrainingCombination[] = [];
    let id = 1;
    
    for (const technique of techniques) {
      for (const cuePoint of cuePoints) {
        for (const power of powers) {
          combinations.push({
            id: id++,
            technique,
            cuePoint,
            power,
            completed: false
          });
        }
      }
    }
    
    return combinations;
  };

  // Generate accuracy training combinations (五分点练习)
  const generateAccuracyTrainingCombinations = (): TrainingCombination[] => {
    const ballPositions = [
      '中央正位', '左侧15度', '右侧15度', '左侧30度', '右侧30度',
      '左侧45度', '右侧45度', '左侧60度', '右侧60度', '直线远台'
    ];
    const targetPockets = [
      '左上角袋', '右上角袋', '左下角袋', '右下角袋', '顶边中袋', '底边中袋'
    ];
    const difficulties = ['基础', '进阶', '高级'];
    
    const combinations: TrainingCombination[] = [];
    let id = 1;
    
    for (const position of ballPositions) {
      for (const pocket of targetPockets) {
        for (const difficulty of difficulties) {
          combinations.push({
            id: id++,
            technique: position,
            cuePoint: pocket,
            power: difficulty,
            completed: false
          });
        }
      }
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
      description: '五分点练习，从不同角度和位置击球入袋，提升击球精度',
      type: 'accuracy',
      combinations: generateAccuracyTrainingCombinations(),
      currentRound: 1,
      currentCombination: 0,
      totalRounds: 5
    };
  };

  // Get training programs
  const { data: programs = [] } = useQuery<TrainingProgram[]>({
    queryKey: ["/api/training-programs"],
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

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: (sessionId: number) => {
      // Combine training notes with coaching feedback if available
      const currentNotes = selectedSessionType === "custom" ? customTrainingNotes 
                          : selectedSessionType === "特训" ? specialTrainingNotes 
                          : guidedTrainingNotes;
      const currentDuration = selectedSessionType === "custom" ? customElapsedTime 
                             : selectedSessionType === "特训" ? specialElapsedTime 
                             : guidedElapsedTime;
      const combinedNotes = coachingFeedback 
        ? `${currentNotes}\n\n🏓 教练回复：\n${coachingFeedback}`
        : currentNotes;
      
      return apiRequest(`/api/training-sessions/${sessionId}/complete`, "POST", { 
        notes: combinedNotes, 
        rating: userRating, 
        duration: currentDuration 
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      
      setShowTrainingComplete(false);
      if (selectedSessionType === "custom") {
        setIsCustomTraining(false);
        setCustomElapsedTime(0);
        setCustomTrainingNotes("");
      } else if (selectedSessionType === "特训") {
        setIsSpecialTraining(false);
        setIsSpecialPaused(false);
        setCurrentSpecialTraining(null);
        setSpecialElapsedTime(0);
        setSpecialTrainingNotes("");
        setSpecialTrainingSessionId(null);
      } else {
        setIsGuidedTraining(false);
        setGuidedElapsedTime(0);
        setGuidedTrainingNotes("");
      }
      setUserRating(0);
      setCoachingFeedback("");
      
      // Show experience reward notification
      const response = data as any;
      if (response.expGained) {
        toast({ 
          title: "训练完成", 
          description: `获得 ${response.expGained} 经验值！${selectedSessionType === "特训" ? "" : "进入下一集"}`,
          duration: 3000
        });
      } else {
        toast({ 
          title: "训练完成", 
          description: `您的训练记录已保存${selectedSessionType === "特训" ? "" : "，进入下一集"}` 
        });
      }
      
      // Progress to next episode only for guided training
      if (selectedSessionType !== "特训" && selectedSessionType !== "custom") {
        nextEpisodeMutation.mutate();
      }
    }
  });

  // Start custom training mutation
  const startCustomTrainingMutation = useMutation({
    mutationFn: () => 
      apiRequest("/api/training-sessions", "POST", {
        title: "自主训练",
        description: "根据个人需要自由安排的训练内容",
        sessionType: "自主训练"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      toast({ title: "训练开始", description: "自主训练已开始" });
    }
  });

  // Start special training mutation
  const startSpecialTrainingMutation = useMutation({
    mutationFn: (trainingData: { title: string; description: string }) => 
      apiRequest("/api/training-sessions", "POST", {
        userId: 1,
        title: trainingData.title,
        description: trainingData.description,
        sessionType: "特训"
      }),
    onSuccess: (data: any) => {
      setSpecialTrainingSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
    }
  });

  // Next episode mutation
  const nextEpisodeMutation = useMutation({
    mutationFn: () => apiRequest("/api/training-programs/next-episode", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-programs"] });
    }
  });

  // Timer effects for both training types
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTraining = () => {
    setSelectedSessionType("系统训练");
    setIsGuidedTraining(true);
    setIsGuidedPaused(false);
    setGuidedElapsedTime(0);
  };

  const handlePauseTraining = () => {
    if (selectedSessionType === "custom") {
      setIsCustomPaused(!isCustomPaused);
    } else {
      setIsGuidedPaused(!isGuidedPaused);
    }
  };

  const handleStopTraining = () => {
    setShowTrainingComplete(true);
  };

  const generateCoachingFeedback = async () => {
    const currentNotes = selectedSessionType === "custom" ? customTrainingNotes : guidedTrainingNotes;
    const currentDuration = selectedSessionType === "custom" ? customElapsedTime : guidedElapsedTime;
    
    if (!currentNotes.trim()) return;
    
    setLoadingFeedback(true);
    try {
      const response = await apiRequest("/api/coaching-feedback", "POST", {
        duration: currentDuration,
        summary: currentNotes,
        rating: userRating,
        exerciseType: selectedSessionType === "custom" ? "自主训练" : (currentSession?.sessionType || "系统训练"),
        level: 9 // User's current level
      });
      const data = await response.json();
      setCoachingFeedback(data.feedback);
    } catch (error) {
      console.error("Coaching feedback error:", error);
      toast({
        title: "获取教练反馈失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleCompleteTraining = () => {
    // Use appropriate session ID based on training type
    let sessionId = null;
    if (selectedSessionType === "特训" && specialTrainingSessionId) {
      sessionId = specialTrainingSessionId;
    } else if (currentSession) {
      sessionId = currentSession.id;
    }
    
    if (sessionId) {
      completeSessionMutation.mutate(sessionId);
    }
    
    // Reset state based on training type
    if (selectedSessionType === "特训") {
      setIsSpecialTraining(false);
      setIsSpecialPaused(false);
      setCurrentSpecialTraining(null);
      setSpecialElapsedTime(0);
      setSpecialTrainingNotes("");
      setSpecialTrainingSessionId(null);
    } else if (selectedSessionType === "custom") {
      setIsCustomTraining(false);
      setIsCustomPaused(false);
      setCustomElapsedTime(0);
      setCustomTrainingNotes("");
    } else {
      setIsGuidedTraining(false);
      setIsGuidedPaused(false);
      setGuidedElapsedTime(0);
      setGuidedTrainingNotes("");
    }
  };

  const handleStartCustomTraining = () => {
    setSelectedSessionType("custom");
    setIsCustomTraining(true);
    setIsCustomPaused(false);
    setCustomElapsedTime(0);
    
    // Create a custom training session
    startCustomTrainingMutation.mutate();
  };

  const handleCompleteCustomTraining = () => {
    setShowTrainingComplete(true);
  };

  const handleStartSpecialTraining = (type: 'power' | 'accuracy') => {
    let training: SpecialTraining;
    
    if (type === 'power') {
      training = initializePowerTraining();
      toast({ title: "特训开始", description: "发力特训已开始" });
    } else if (type === 'accuracy') {
      training = initializeAccuracyTraining();
      toast({ title: "特训开始", description: "准度特训已开始" });
    } else {
      return;
    }
    
    setCurrentSpecialTraining(training);
    setIsSpecialTraining(true);
    setIsSpecialPaused(false);
    setSpecialElapsedTime(0);
    setSelectedSessionType("特训");
    
    // Create training session
    startSpecialTrainingMutation.mutate({
      title: training.name,
      description: training.description
    });
  };

  const handlePauseSpecialTraining = () => {
    setIsSpecialPaused(!isSpecialPaused);
  };

  const handleCompleteCurrentCombination = () => {
    if (!currentSpecialTraining) return;
    
    const updatedTraining = { ...currentSpecialTraining };
    const currentCombo = updatedTraining.combinations[updatedTraining.currentCombination];
    
    if (currentCombo) {
      currentCombo.completed = true;
      
      // Move to next combination
      if (updatedTraining.currentCombination < updatedTraining.combinations.length - 1) {
        updatedTraining.currentCombination++;
      } else {
        // All combinations completed, start new round
        updatedTraining.currentRound++;
        updatedTraining.currentCombination = 0;
        
        // Reset all combinations for new round
        updatedTraining.combinations.forEach(combo => combo.completed = false);
      }
      
      setCurrentSpecialTraining(updatedTraining);
      
      const combo = currentCombo;
      toast({ 
        title: "组合完成", 
        description: `${combo.cuePoint} + ${combo.technique} + ${combo.power} 完成！`,
        duration: 2000
      });
    }
  };

  const handleCompleteSpecialTraining = () => {
    setSelectedSessionType("特训");
    setShowTrainingComplete(true);
  };

  const getDifficultyBadge = (day: number) => {
    if (day <= 17) return { label: "初级", color: "bg-green-100 text-green-800" };
    if (day <= 34) return { label: "中级", color: "bg-yellow-100 text-yellow-800" };
    return { label: "高级", color: "bg-red-100 text-red-800" };
  };

  const mainProgram = programs.find(p => p.name === "耶氏台球学院系统教学");
  const currentDay = mainProgram?.currentDay || 1;
  const currentEpisode = `第${currentDay}集`;
  const difficultyBadge = getDifficultyBadge(currentDay);

  const completedSessions = sessions.filter(s => s.completed);
  const todayCompletedSessions = completedSessions.filter(session => 
    session.completedAt && new Date(session.completedAt).toDateString() === new Date().toDateString()
  );
  const todayProgress = todayCompletedSessions.length;
  
  // Calculate today's experience gained
  const todayExpGained = todayCompletedSessions.reduce((total, session) => {
    const baseExp = session.sessionType === "custom" ? 30 : 50;
    const durationMinutes = session.duration ? Math.floor(session.duration / 60) : 10;
    const durationMultiplier = durationMinutes < 10 ? 0.8 : durationMinutes <= 30 ? 1.0 : durationMinutes <= 60 ? 1.3 : 1.5;
    const ratingMultiplier = session.rating ? [0.6, 0.8, 1.0, 1.2, 1.5][session.rating - 1] : 1.0;
    return total + Math.round(baseExp * durationMultiplier * ratingMultiplier);
  }, 0);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700">训练计划</h1>
        <p className="text-sm sm:text-base text-gray-600">耶氏台球学院系统教学 · 共30集</p>
        <div className="flex items-center justify-center text-gray-500 text-sm">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date().toLocaleDateString('zh-CN')}
        </div>
      </div>

      {/* Guided Training Section */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-green-600" />
              <span className="text-lg font-medium">系统训练：{currentEpisode}</span>
            </div>
            <div className="flex space-x-2">
              <Badge className={difficultyBadge.color}>
                {difficultyBadge.label}
              </Badge>
              <Badge variant="outline">
                第{Math.ceil(currentDay / 7)}周
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{currentSession?.title || `第${currentDay}集：基础技能训练`}</h3>
            <p className="text-gray-600 mb-4">
              {(currentSession as any)?.day?.description || currentSession?.description || `第${currentDay}集训练内容，持续提升台球技能。`}
            </p>
            
            {(currentSession as any)?.day?.objectives && (
              <div className="mb-3">
                <h4 className="font-medium text-sm text-gray-700 mb-2">📋 训练目标</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {(currentSession as any).day.objectives.map((objective: string, index: number) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(currentSession as any)?.day?.keyPoints && (currentSession as any).day.keyPoints.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium text-sm text-gray-700 mb-2">🎯 重点要求</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {(currentSession as any).day.keyPoints.map((point: string, index: number) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="text-sm text-gray-500 mb-4">
              课程类别：基础训练
              {(currentSession as any)?.day?.estimatedDuration && (
                <span className="ml-4">⏱️ 建议时长：{(currentSession as any).day.estimatedDuration}分钟</span>
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
                    <Button onClick={handleStopTraining} variant="destructive" className="touch-target h-12 sm:h-auto">
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
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            {/* Timer Display */}
            <div className="text-3xl font-mono text-blue-600">
              {formatTime(customElapsedTime)}
            </div>
            
            {/* Training Button */}
            <div className="flex justify-center">
              {!isCustomTraining ? (
                <Button 
                  onClick={handleStartCustomTraining} 
                  className="bg-blue-600 hover:bg-blue-700 touch-target h-12 px-8 w-full max-w-xs rounded-lg text-lg font-medium"
                >
                  <Play className="h-5 w-5 mr-3" />
                  自主训练
                </Button>
              ) : (
                <div className="flex gap-3 w-full max-w-md">
                  <Button 
                    onClick={handlePauseTraining} 
                    variant="outline" 
                    className="touch-target h-12 flex-1 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {isCustomPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                    {isCustomPaused ? "继续" : "暂停"}
                  </Button>
                  <Button 
                    onClick={handleCompleteCustomTraining} 
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
                      <div className="text-xs opacity-75">180种组合</div>
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
                      第 {currentSpecialTraining.currentRound} 轮 / 共 {currentSpecialTraining.totalRounds} 轮
                    </div>
                    
                    {/* Current Combination */}
                    <div className="bg-purple-100 rounded-lg p-3 mb-4">
                      <div className="text-sm text-purple-700 mb-2">当前组合：</div>
                      <div className="text-lg font-bold text-purple-900">
                        {currentSpecialTraining.type === 'power' ? (
                          <>
                            {currentSpecialTraining.combinations[currentSpecialTraining.currentCombination]?.cuePoint} + {' '}
                            {currentSpecialTraining.combinations[currentSpecialTraining.currentCombination]?.technique} + {' '}
                            {currentSpecialTraining.combinations[currentSpecialTraining.currentCombination]?.power}
                          </>
                        ) : (
                          <>
                            {currentSpecialTraining.combinations[currentSpecialTraining.currentCombination]?.technique} → {' '}
                            {currentSpecialTraining.combinations[currentSpecialTraining.currentCombination]?.cuePoint} ({currentSpecialTraining.combinations[currentSpecialTraining.currentCombination]?.power})
                          </>
                        )}
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        进度: {currentSpecialTraining.currentCombination + 1} / {currentSpecialTraining.combinations.length}
                      </div>
                      
                      {/* 准度特训图示 */}
                      {currentSpecialTraining.type === 'accuracy' && (
                        <div className="mt-4 bg-white rounded-lg p-3 border">
                          <div className="text-xs text-gray-600 mb-3 text-center">球桌示意图</div>
                          <div className="relative bg-green-100 rounded-lg border-2 border-brown-500" style={{aspectRatio: '2/1', height: '120px'}}>
                            {/* 台球桌边框 */}
                            <div className="absolute inset-0 border-4 border-brown-600 rounded-lg"></div>
                            
                            {/* 六个袋口 */}
                            <div className="absolute -top-2 -left-2 w-4 h-4 bg-black rounded-full"></div>
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black rounded-full"></div>
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-black rounded-full"></div>
                            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-black rounded-full"></div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black rounded-full"></div>
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-black rounded-full"></div>
                            
                            {/* 目标球位置 */}
                            {(() => {
                              const position = currentSpecialTraining.combinations[currentSpecialTraining.currentCombination]?.technique;
                              let ballStyle = {};
                              
                              switch(position) {
                                case '中央正位':
                                  ballStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
                                  break;
                                case '左侧15度':
                                  ballStyle = { top: '50%', left: '35%', transform: 'translate(-50%, -50%)' };
                                  break;
                                case '右侧15度':
                                  ballStyle = { top: '50%', left: '65%', transform: 'translate(-50%, -50%)' };
                                  break;
                                case '左侧30度':
                                  ballStyle = { top: '40%', left: '25%', transform: 'translate(-50%, -50%)' };
                                  break;
                                case '右侧30度':
                                  ballStyle = { top: '40%', left: '75%', transform: 'translate(-50%, -50%)' };
                                  break;
                                case '左侧45度':
                                  ballStyle = { top: '30%', left: '20%', transform: 'translate(-50%, -50%)' };
                                  break;
                                case '右侧45度':
                                  ballStyle = { top: '30%', left: '80%', transform: 'translate(-50%, -50%)' };
                                  break;
                                case '左侧60度':
                                  ballStyle = { top: '25%', left: '15%', transform: 'translate(-50%, -50%)' };
                                  break;
                                case '右侧60度':
                                  ballStyle = { top: '25%', left: '85%', transform: 'translate(-50%, -50%)' };
                                  break;
                                case '直线远台':
                                  ballStyle = { top: '20%', left: '50%', transform: 'translate(-50%, -50%)' };
                                  break;
                                default:
                                  ballStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
                              }
                              
                              return (
                                <div 
                                  className="absolute w-3 h-3 bg-red-500 rounded-full border border-red-700"
                                  style={ballStyle}
                                ></div>
                              );
                            })()}
                            
                            {/* 目标袋口高亮 */}
                            {(() => {
                              const targetPocket = currentSpecialTraining.combinations[currentSpecialTraining.currentCombination]?.cuePoint;
                              let pocketStyle = {};
                              
                              switch(targetPocket) {
                                case '左上角袋':
                                  pocketStyle = { top: '-8px', left: '-8px' };
                                  break;
                                case '右上角袋':
                                  pocketStyle = { top: '-8px', right: '-8px' };
                                  break;
                                case '左下角袋':
                                  pocketStyle = { bottom: '-8px', left: '-8px' };
                                  break;
                                case '右下角袋':
                                  pocketStyle = { bottom: '-8px', right: '-8px' };
                                  break;
                                case '顶边中袋':
                                  pocketStyle = { top: '-8px', left: '50%', transform: 'translateX(-50%)' };
                                  break;
                                case '底边中袋':
                                  pocketStyle = { bottom: '-8px', left: '50%', transform: 'translateX(-50%)' };
                                  break;
                              }
                              
                              return (
                                <div 
                                  className="absolute w-4 h-4 bg-yellow-400 rounded-full border-2 border-yellow-600 animate-pulse"
                                  style={pocketStyle}
                                ></div>
                              );
                            })()}
                            
                            {/* 开球线 - 位于台面底部1/4处 */}
                            <div className="absolute bottom-1/4 left-2 right-2 h-0.5 bg-white opacity-60"></div>
                            
                            {/* 主球位置 - 根据击球线原理计算 */}
                            {(() => {
                              const targetPocket = currentSpecialTraining.combinations[currentSpecialTraining.currentCombination]?.cuePoint;
                              const ballPosition = currentSpecialTraining.combinations[currentSpecialTraining.currentCombination]?.technique;
                              
                              // 台球击球原理：主球需要击中目标球背离袋口的一侧
                              // 目标球中心到袋口中心的直线，向后延伸约两个球径的距离
                              let cueBallStyle = {};
                              
                              // 目标球在中央正位(50%, 50%)
                              if (ballPosition === '中央正位') {
                                switch(targetPocket) {
                                  case '左上角袋':
                                    // 目标球到左上角袋的反方向延长线
                                    // 左上角袋在(0%, 0%)，目标球在(50%, 50%)
                                    // 主球应该在(75%, 75%)位置
                                    cueBallStyle = { bottom: '20px', right: '20%', transform: 'translate(50%, 50%)' };
                                    break;
                                  case '右上角袋':
                                    // 右上角袋在(100%, 0%)，目标球在(50%, 50%)
                                    // 主球应该在(25%, 75%)位置
                                    cueBallStyle = { bottom: '20px', left: '20%', transform: 'translate(-50%, 50%)' };
                                    break;
                                  case '左下角袋':
                                    // 左下角袋在(0%, 100%)，目标球在(50%, 50%)
                                    // 主球应该在(75%, 25%)位置
                                    cueBallStyle = { top: '20%', right: '20%', transform: 'translate(50%, -50%)' };
                                    break;
                                  case '右下角袋':
                                    // 右下角袋在(100%, 100%)，目标球在(50%, 50%)
                                    // 主球应该在(25%, 25%)位置
                                    cueBallStyle = { top: '20%', left: '20%', transform: 'translate(-50%, -50%)' };
                                    break;
                                  case '顶边中袋':
                                    // 顶边中袋在(50%, 0%)，目标球在(50%, 50%)
                                    // 主球应该在(50%, 80%)位置
                                    cueBallStyle = { bottom: '15px', left: '50%', transform: 'translateX(-50%)' };
                                    break;
                                  case '底边中袋':
                                    // 底边中袋在(50%, 100%)，目标球在(50%, 50%)
                                    // 主球应该在(50%, 20%)位置
                                    cueBallStyle = { top: '15px', left: '50%', transform: 'translateX(-50%)' };
                                    break;
                                  default:
                                    cueBallStyle = { bottom: '15px', left: '50%', transform: 'translateX(-50%)' };
                                }
                              } else {
                                // 其他球位的计算逻辑
                                cueBallStyle = { bottom: '15px', left: '50%', transform: 'translateX(-50%)' };
                              }
                              
                              return (
                                <div 
                                  className="absolute w-3 h-3 bg-white rounded-full border border-gray-600"
                                  style={cueBallStyle}
                                ></div>
                              );
                            })()}
                            

                          </div>
                          
                          <div className="mt-2 text-xs text-center">
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                            目标球
                            <span className="inline-block w-2 h-2 bg-white border border-gray-600 rounded-full ml-3 mr-1"></span>
                            主球
                            <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full ml-3 mr-1"></span>
                            目标袋口
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Control Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={handlePauseSpecialTraining} 
                        variant="outline" 
                        className="touch-target h-12 flex-1 rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                      >
                        {isSpecialPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                        {isSpecialPaused ? "继续" : "暂停"}
                      </Button>
                      <Button 
                        onClick={handleCompleteCurrentCombination}
                        className="bg-green-600 hover:bg-green-700 touch-target h-12 flex-1 rounded-lg"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        完成组合
                      </Button>
                      <Button 
                        onClick={handleCompleteSpecialTraining}
                        className="bg-purple-600 hover:bg-purple-700 touch-target h-12 flex-1 rounded-lg"
                      >
                        结束特训
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {isSpecialTraining && (
              <div className="space-y-3 mt-6">
                <Label htmlFor="special-notes">训练笔记</Label>
                <Textarea
                  id="special-notes"
                  placeholder="记录特训心得、技巧要点或改进建议..."
                  value={specialTrainingNotes}
                  onChange={(e) => setSpecialTrainingNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            今日进度
            <span className="ml-auto text-sm font-normal text-gray-500">
              {todayProgress}/3 完成
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={(todayProgress / 3) * 100} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-500">{todayExpGained}</div>
                <div className="text-sm text-gray-500">经验值</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">{todayProgress}</div>
                <div className="text-sm text-gray-500">今日打卡</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{todayProgress > 0 ? todayProgress * 10 : 0}</div>
                <div className="text-sm text-gray-500">完成奖励</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Records */}
      {trainingRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>训练记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainingRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="bg-gradient-to-r from-green-50 to-transparent border-l-4 border-green-500 rounded-r-lg p-4 transition-all hover:shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 text-base">{record.title}</h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          {record.duration && (
                            <div className="flex items-center bg-blue-100 px-2 py-1 rounded-full">
                              <Clock className="h-3 w-3 mr-1 text-blue-600" />
                              <span className="text-blue-700 font-medium">{Math.floor(record.duration / 60)}分钟</span>
                            </div>
                          )}
                          {record.rating && (
                            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                              <Star className="h-3 w-3 mr-1 text-yellow-600 fill-current" />
                              <span className="text-yellow-700 font-medium">{record.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-white/70 rounded-md p-3 border border-green-100">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{record.content}</p>
                      </div>
                      
                      <div className="flex items-center mt-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          {new Date(record.completedAt).toLocaleDateString('zh-CN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Complete Dialog */}
      <Dialog open={showTrainingComplete} onOpenChange={setShowTrainingComplete}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>训练完成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatTime(
                  selectedSessionType === "custom" ? customElapsedTime 
                  : selectedSessionType === "特训" ? specialElapsedTime 
                  : guidedElapsedTime
                )}
              </div>
              <p className="text-gray-600">本次训练时长</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="final-notes">训练总结</Label>
                {(selectedSessionType === "custom" ? customTrainingNotes 
                  : selectedSessionType === "特训" ? specialTrainingNotes 
                  : guidedTrainingNotes).trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateCoachingFeedback}
                    disabled={loadingFeedback}
                    className="text-xs"
                  >
                    {loadingFeedback ? "分析中..." : "发送给教练"}
                  </Button>
                )}
              </div>
              <Textarea
                id="final-notes"
                placeholder="总结本次训练的收获和感受..."
                value={selectedSessionType === "custom" ? customTrainingNotes 
                       : selectedSessionType === "特训" ? specialTrainingNotes 
                       : guidedTrainingNotes}
                onChange={(e) => {
                  if (selectedSessionType === "custom") {
                    setCustomTrainingNotes(e.target.value);
                  } else if (selectedSessionType === "特训") {
                    setSpecialTrainingNotes(e.target.value);
                  } else {
                    setGuidedTrainingNotes(e.target.value);
                  }
                }}
                className="min-h-[100px]"
              />
              
              {coachingFeedback && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mt-3">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-green-600 text-xs">🏓</span>
                      </div>
                      <div className="text-xs font-semibold text-green-700">教练回复</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-800 leading-relaxed whitespace-pre-wrap bg-white/60 rounded-md p-3 border border-green-100 max-h-40 overflow-y-auto">
                    {coachingFeedback}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>训练评分</Label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={userRating >= rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserRating(rating)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>



            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowTrainingComplete(false)}
                className="order-2 sm:order-1"
              >
                继续训练
              </Button>
              <Button 
                onClick={handleCompleteTraining}
                disabled={completeSessionMutation.isPending}
                className="flex-1 order-1 sm:order-2"
              >
                保存并完成
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Training Dialog */}
      <Dialog open={showCustomTraining} onOpenChange={setShowCustomTraining}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建自定义训练</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="custom-title">训练标题</Label>
              <Input
                id="custom-title"
                placeholder="输入训练标题"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-description">训练描述</Label>
              <Textarea
                id="custom-description"
                placeholder="描述训练内容和目标..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>训练类型</Label>
              <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="自定义训练">自定义训练</SelectItem>
                  <SelectItem value="技术练习">技术练习</SelectItem>
                  <SelectItem value="体能训练">体能训练</SelectItem>
                  <SelectItem value="心理训练">心理训练</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowCustomTraining(false)}>
                取消
              </Button>
              <Button 
                onClick={() => startCustomTrainingMutation.mutate()}
                disabled={!customTitle || startCustomTrainingMutation.isPending}
                className="flex-1"
              >
                开始训练
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}