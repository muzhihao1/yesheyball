import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Play, Pause, Square, BookOpen, Target, Zap, Star } from "lucide-react";

export default function Tasks() {
  const { toast } = useToast();
  
  // Training states
  const [isGuidedTraining, setIsGuidedTraining] = useState(false);
  const [isCustomTraining, setIsCustomTraining] = useState(false);
  const [isSpecialTraining, setIsSpecialTraining] = useState(false);
  const [guidedElapsedTime, setGuidedElapsedTime] = useState(0);
  const [customElapsedTime, setCustomElapsedTime] = useState(0);
  const [specialElapsedTime, setSpecialElapsedTime] = useState(0);
  const [isGuidedPaused, setIsGuidedPaused] = useState(false);
  const [isCustomPaused, setIsCustomPaused] = useState(false);
  const [isSpecialPaused, setIsSpecialPaused] = useState(false);
  
  // Training completion states
  const [showTrainingComplete, setShowTrainingComplete] = useState(false);
  const [trainingNotes, setTrainingNotes] = useState("");
  const [completionRating, setCompletionRating] = useState("");
  const [currentSessionType, setCurrentSessionType] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  // Get training programs with error handling
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["/api/training-programs"],
    retry: 1,
    staleTime: 10 * 60 * 1000,
  });

  const programsArray = Array.isArray(programs) ? programs : [];
  const mainProgram = programsArray.find((p: any) => p?.name === "耶氏台球学院系统教学");
  
  // Get training days with error handling
  const { data: trainingDays = [], isLoading: daysLoading } = useQuery({
    queryKey: [`/api/training-programs/${mainProgram?.id}/days`],
    enabled: !!mainProgram?.id,
    retry: 1,
    staleTime: 15 * 60 * 1000,
  });

  const trainingDaysArray = Array.isArray(trainingDays) ? trainingDays : [];

  // Get training records for display
  const { data: trainingRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/training-records"],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const recordsArray = Array.isArray(trainingRecords) ? trainingRecords : [];



  // Direct training completion mutation (simplified approach)
  const completeTrainingMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      // Create and complete session in one step
      const response = await apiRequest("/api/training-sessions", "POST", {
        ...sessionData,
        completed: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowTrainingComplete(false);
      setTrainingNotes("");
      setCompletionRating("");
      resetTrainingStates();
      toast({
        title: "训练完成",
        description: "训练记录已保存，经验值已获得"
      });
    },
    onError: (error: Error) => {
      console.error("Complete training error:", error);
      toast({
        title: "保存失败",
        description: error.message || "训练记录保存失败，请重试",
        variant: "destructive"
      });
    }
  });

  // Timer effects with cleanup
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGuidedTraining && !isGuidedPaused) {
      interval = setInterval(() => {
        setGuidedElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGuidedTraining, isGuidedPaused]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCustomTraining && !isCustomPaused) {
      interval = setInterval(() => {
        setCustomElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCustomTraining, isCustomPaused]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSpecialTraining && !isSpecialPaused) {
      interval = setInterval(() => {
        setSpecialElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpecialTraining, isSpecialPaused]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Difficulty badge helper
  const getDifficultyBadge = (day: number) => {
    if (day <= 17) return { label: "初级", color: "bg-green-100 text-green-800" };
    if (day <= 34) return { label: "中级", color: "bg-yellow-100 text-yellow-800" };
    return { label: "高级", color: "bg-red-100 text-red-800" };
  };

  // Reset training states
  const resetTrainingStates = () => {
    setIsGuidedTraining(false);
    setIsCustomTraining(false);
    setIsSpecialTraining(false);
    setGuidedElapsedTime(0);
    setCustomElapsedTime(0);
    setSpecialElapsedTime(0);
    setIsGuidedPaused(false);
    setIsCustomPaused(false);
    setIsSpecialPaused(false);
  };

  // Training control handlers
  const handleStartTraining = () => {
    if (isGuidedTraining || isCustomTraining || isSpecialTraining) {
      toast({ 
        title: "无法开始训练", 
        description: "请先完成或取消当前训练",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentSessionType("系统训练");
    setIsGuidedTraining(true);
    setGuidedElapsedTime(0);
    setIsGuidedPaused(false);
    
    toast({ 
      title: "系统训练开始", 
      description: `第${currentDay}集：${currentDayTraining?.title || "训练"}已开始` 
    });
  };

  const handleStartCustomTraining = () => {
    if (isGuidedTraining || isCustomTraining || isSpecialTraining) {
      toast({ 
        title: "无法开始训练", 
        description: "请先完成或取消当前训练",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentSessionType("自主训练");
    setIsCustomTraining(true);
    setCustomElapsedTime(0);
    setIsCustomPaused(false);
    
    toast({ 
      title: "自主训练开始", 
      description: "根据个人需要进行练习" 
    });
  };

  const handleStartSpecialTraining = () => {
    if (isGuidedTraining || isCustomTraining || isSpecialTraining) {
      toast({ 
        title: "无法开始训练", 
        description: "请先完成或取消当前训练",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentSessionType("特训");
    setIsSpecialTraining(true);
    setSpecialElapsedTime(0);
    setIsSpecialPaused(false);
    
    toast({ 
      title: "特训开始", 
      description: "专注于力度和准度的针对性训练" 
    });
  };

  const handleStopTraining = () => {
    // Open completion dialog instead of immediately stopping
    setShowTrainingComplete(true);
  };

  const handleCompleteTraining = () => {
    if (!completionRating) {
      toast({ 
        title: "请选择训练评分", 
        variant: "destructive" 
      });
      return;
    }
    
    const duration = isGuidedTraining ? guidedElapsedTime : 
                    isCustomTraining ? customElapsedTime : 
                    specialElapsedTime;
    
    const sessionData = {
      title: currentSessionType === "系统训练" ? 
        `第${currentDay}集：${currentDayTraining?.title || "训练"}` : 
        currentSessionType,
      description: currentSessionType === "系统训练" ? 
        currentDayTraining?.description || "" : 
        currentSessionType === "特训" ? "专注于力度和准度的针对性训练" : "根据个人需要进行针对性练习",
      sessionType: currentSessionType === "系统训练" ? "guided" : "custom",
      duration,
      notes: trainingNotes,
      rating: parseInt(completionRating),
      programId: currentSessionType === "系统训练" ? mainProgram?.id : undefined,
      dayId: currentSessionType === "系统训练" ? currentDayTraining?.day : undefined
    };
    
    completeTrainingMutation.mutate(sessionData);
  };

  // Loading state
  if (programsLoading || daysLoading) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (!mainProgram) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">训练计划加载中...</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              刷新页面
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe data access
  const currentDay = mainProgram?.currentDay || 1;
  const currentEpisode = `第${currentDay}集`;
  const difficultyBadge = getDifficultyBadge(currentDay);
  const currentDayTraining = trainingDaysArray.find((day: any) => day?.day === currentDay);
  const isAnyTrainingActive = isGuidedTraining || isCustomTraining || isSpecialTraining;

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
            <h3 className="text-xl font-semibold mb-2">
              第{currentDay}集：{currentDayTraining?.title || "握杆"}
            </h3>
            <p className="text-gray-600 mb-4">
              {currentDayTraining?.description || `第${currentDay}集训练内容，持续提升台球技能。`}
            </p>
            
            {!isGuidedTraining ? (
              <Button
                onClick={handleStartTraining}
                className="w-full bg-green-600 hover:bg-green-700 touch-target"
                disabled={isAnyTrainingActive}
              >
                {isAnyTrainingActive ? "其他训练进行中" : "开始系统训练"}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Training Content Display */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="font-mono text-2xl font-bold text-green-800">{formatTime(guidedElapsedTime)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setIsGuidedPaused(!isGuidedPaused)}
                        variant="outline"
                        size="sm"
                      >
                        {isGuidedPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Training Content */}
                  <div className="space-y-3">
                    {/* Training Objectives */}
                    {currentDayTraining?.objectives && currentDayTraining.objectives.length > 0 && (
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-green-800 mb-2">训练目标</h4>
                        <div className="space-y-1">
                          {currentDayTraining.objectives.map((objective: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-green-600 text-sm">•</span>
                              <span className="text-sm text-gray-700">{objective}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Key Points */}
                    {currentDayTraining?.keyPoints && currentDayTraining.keyPoints.length > 0 && (
                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-blue-800 mb-2">技术要点</h4>
                        <div className="space-y-1">
                          {currentDayTraining.keyPoints.map((point: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <span className="text-blue-600 text-sm">•</span>
                              <span className="text-sm text-gray-700">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Duration Info */}
                    {currentDayTraining?.estimatedDuration && (
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">预计训练时长</span>
                          <Badge variant="outline" className="text-xs">
                            {currentDayTraining.estimatedDuration} 分钟
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 训练心得记录区域 */}
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <h4 className="text-sm font-medium text-green-800 mb-2">训练心得记录</h4>
                    <textarea
                      value={trainingNotes}
                      onChange={(e) => setTrainingNotes(e.target.value)}
                      placeholder="记录这次训练的收获、发现的问题或需要改进的地方..."
                      className="w-full h-20 p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <Button
                    onClick={handleStopTraining}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 touch-target"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    完成训练
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Special Training Section */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-purple-600" />
              <div>
                <CardTitle className="text-lg text-purple-800">特训</CardTitle>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-800 text-xs">
                专项训练
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              力度与准度专项训练
            </h3>
            <p className="text-gray-600 mb-4">
              针对性训练，专注于提升击球力度控制和瞄准准确度，快速突破技术瓶颈。
            </p>
            
            {!isSpecialTraining ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleStartSpecialTraining}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2"
                    disabled={isAnyTrainingActive}
                  >
                    <Zap className="h-4 w-4" />
                    <span>力度训练</span>
                  </Button>
                  <Button
                    onClick={handleStartSpecialTraining}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2"
                    disabled={isAnyTrainingActive}
                  >
                    <Target className="h-4 w-4" />
                    <span>准度训练</span>
                  </Button>
                </div>
                {isAnyTrainingActive && (
                  <p className="text-sm text-gray-500 text-center">其他训练进行中</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span className="font-mono text-2xl font-bold text-purple-800">{formatTime(specialElapsedTime)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setIsSpecialPaused(!isSpecialPaused)}
                        variant="outline"
                        size="sm"
                        className="touch-target"
                      >
                        {isSpecialPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={handleStopTraining}
                        variant="default"
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 touch-target"
                      >
                        <Square className="h-4 w-4 mr-1" />
                        完成特训
                      </Button>
                    </div>
                  </div>
                  
                  {/* 训练心得记录区域 */}
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <h4 className="text-sm font-medium text-purple-800 mb-2">训练心得记录</h4>
                    <textarea
                      value={trainingNotes}
                      onChange={(e) => setTrainingNotes(e.target.value)}
                      placeholder="记录这次训练的收获、发现的问题或需要改进的地方..."
                      className="w-full h-20 p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Training Section */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-800">自主训练</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            根据个人需要进行针对性练习，可以专注于特定技巧或弱项改进。
          </p>
          
          {!isCustomTraining ? (
            <Button
              onClick={handleStartCustomTraining}
              className="w-full bg-blue-600 hover:bg-blue-700 touch-target"
              disabled={isAnyTrainingActive}
            >
              {isAnyTrainingActive ? "其他训练进行中" : "开始自主训练"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-mono text-2xl font-bold text-blue-800">{formatTime(customElapsedTime)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsCustomPaused(!isCustomPaused)}
                      variant="outline"
                      size="sm"
                      className="touch-target"
                    >
                      {isCustomPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={handleStopTraining}
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 touch-target"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      完成训练
                    </Button>
                  </div>
                </div>
                
                {/* 训练心得记录区域 */}
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">训练心得记录</h4>
                  <textarea
                    value={trainingNotes}
                    onChange={(e) => setTrainingNotes(e.target.value)}
                    placeholder="记录这次训练的收获、发现的问题或需要改进的地方..."
                    className="w-full h-20 p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Records Section */}
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-gray-600" />
              <div>
                <CardTitle className="text-lg text-gray-800">练球日志</CardTitle>
                <p className="text-sm text-gray-600 mt-1">查看最近的训练记录</p>
              </div>
            </div>
            <Badge className="bg-gray-100 text-gray-800 text-xs">
              {recordsArray.length} 条记录
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recordsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
            </div>
          ) : recordsArray.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recordsArray.slice(0, 10).map((record: any) => (
                <div key={record.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-white rounded-r-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{record.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(record.duration / 60)}分{record.duration % 60}秒
                        </span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {record.rating}/5
                        </span>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">{record.notes}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {new Date(record.completedAt || record.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">还没有训练记录</p>
              <p className="text-xs text-gray-400 mt-1">完成训练后记录会显示在这里</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Completion Dialog */}
      <Dialog open={showTrainingComplete} onOpenChange={setShowTrainingComplete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>完成训练</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="training-notes">训练心得</Label>
              <Textarea
                id="training-notes"
                placeholder="记录训练过程中的感受、收获或需要改进的地方..."
                value={trainingNotes}
                onChange={(e) => setTrainingNotes(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="completion-rating">训练评分</Label>
              <Select value={completionRating} onValueChange={setCompletionRating}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择训练完成度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1分 - 很不满意</SelectItem>
                  <SelectItem value="2">2分 - 不满意</SelectItem>
                  <SelectItem value="3">3分 - 一般</SelectItem>
                  <SelectItem value="4">4分 - 满意</SelectItem>
                  <SelectItem value="5">5分 - 很满意</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowTrainingComplete(false)}
                className="flex-1"
              >
                继续训练
              </Button>
              <Button
                onClick={handleCompleteTraining}
                disabled={completeTrainingMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {completeTrainingMutation.isPending ? "保存中..." : "完成训练"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}