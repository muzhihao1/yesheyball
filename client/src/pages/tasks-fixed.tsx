import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, Play, Pause, Square, BookOpen } from "lucide-react";
import type { TrainingProgram, TrainingDay } from "@shared/schema";

export default function TasksFixed() {
  const { toast } = useToast();
  
  // Training states
  const [isGuidedTraining, setIsGuidedTraining] = useState(false);
  const [isCustomTraining, setIsCustomTraining] = useState(false);
  const [guidedElapsedTime, setGuidedElapsedTime] = useState(0);
  const [customElapsedTime, setCustomElapsedTime] = useState(0);
  const [isGuidedPaused, setIsGuidedPaused] = useState(false);
  const [isCustomPaused, setIsCustomPaused] = useState(false);
  const [guidedTrainingNotes, setGuidedTrainingNotes] = useState("");
  const [customTrainingNotes, setCustomTrainingNotes] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [showTrainingComplete, setShowTrainingComplete] = useState(false);
  const [completionRating, setCompletionRating] = useState("");

  // Get training programs with error handling
  const { data: programs = [], isLoading: programsLoading, error: programsError } = useQuery<TrainingProgram[]>({
    queryKey: ["/api/training-programs"],
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const mainProgram = programs?.find(p => p?.name === "耶氏台球学院系统教学");
  
  // Get training days with error handling
  const { data: trainingDays = [], isLoading: daysLoading } = useQuery<TrainingDay[]>({
    queryKey: [`/api/training-programs/${mainProgram?.id}/days`],
    enabled: !!mainProgram?.id,
    staleTime: 15 * 60 * 1000,
    retry: 1,
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

  // Format time helper
  const formatTime = (seconds: number): string => {
    try {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } catch {
      return "00:00:00";
    }
  };

  // Difficulty badge helper
  const getDifficultyBadge = (day: number) => {
    try {
      if (day <= 17) return { label: "初级", color: "bg-green-100 text-green-800" };
      if (day <= 34) return { label: "中级", color: "bg-yellow-100 text-yellow-800" };
      return { label: "高级", color: "bg-red-100 text-red-800" };
    } catch {
      return { label: "初级", color: "bg-green-100 text-green-800" };
    }
  };

  // Training control handlers
  const handleStartTraining = () => {
    try {
      if (isGuidedTraining || isCustomTraining) {
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
    } catch (error) {
      console.error("Start training error:", error);
      toast({ 
        title: "启动失败", 
        description: "训练启动失败，请重试",
        variant: "destructive"
      });
    }
  };

  const handleStartCustomTraining = () => {
    try {
      if (isGuidedTraining || isCustomTraining) {
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
    } catch (error) {
      console.error("Start custom training error:", error);
      toast({ 
        title: "启动失败", 
        description: "自主训练启动失败，请重试",
        variant: "destructive"
      });
    }
  };

  const handleCompleteTraining = () => {
    try {
      setShowTrainingComplete(true);
    } catch (error) {
      console.error("Complete training error:", error);
    }
  };

  // Complete session mutation with error handling
  const completeSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/training-sessions", "POST", data);
    },
    onSuccess: () => {
      try {
        queryClient.invalidateQueries({ queryKey: ["/api/training-records"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        setIsGuidedTraining(false);
        setIsCustomTraining(false);
        setGuidedElapsedTime(0);
        setCustomElapsedTime(0);
        setGuidedTrainingNotes("");
        setCustomTrainingNotes("");
        toast({ 
          title: "训练完成", 
          description: "训练记录已成功保存" 
        });
      } catch (error) {
        console.error("Post-completion error:", error);
      }
    },
    onError: (error: any) => {
      console.error("Complete training mutation error:", error);
      toast({ 
        title: "保存失败", 
        description: error?.message || "训练记录保存失败，请重试",
        variant: "destructive"
      });
    }
  });

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
  if (programsError || !mainProgram) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">训练计划加载失败</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              重新加载
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
  const currentDayTraining = trainingDays?.find(day => day?.day === currentDay);
  const isAnyTrainingActive = isGuidedTraining || isCustomTraining;

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
                <div className="flex items-center justify-between p-4 bg-green-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="font-mono text-lg">{formatTime(guidedElapsedTime)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsGuidedPaused(!isGuidedPaused)}
                      variant="outline"
                      size="sm"
                    >
                      {isGuidedPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={handleCompleteTraining}
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      完成训练
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="guided-notes">训练笔记</Label>
                  <Textarea
                    id="guided-notes"
                    placeholder="记录训练心得、技巧要点或需要改进的地方..."
                    value={guidedTrainingNotes}
                    onChange={(e) => setGuidedTrainingNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
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
              <div className="flex items-center justify-between p-4 bg-blue-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-mono text-lg">{formatTime(customElapsedTime)}</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setIsCustomPaused(!isCustomPaused)}
                    variant="outline"
                    size="sm"
                  >
                    {isCustomPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={handleCompleteTraining}
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    完成训练
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="custom-notes">训练笔记</Label>
                <Textarea
                  id="custom-notes"
                  placeholder="记录自主训练内容、技巧练习或心得体会..."
                  value={customTrainingNotes}
                  onChange={(e) => setCustomTrainingNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Complete Dialog */}
      <Dialog open={showTrainingComplete} onOpenChange={setShowTrainingComplete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>完成训练</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>训练评分</Label>
              <Select value={completionRating} onValueChange={setCompletionRating}>
                <SelectTrigger>
                  <SelectValue placeholder="选择训练效果评分" />
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
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowTrainingComplete(false)}
                className="flex-1"
              >
                继续训练
              </Button>
              <Button
                onClick={() => {
                  try {
                    if (!completionRating) {
                      toast({ 
                        title: "请选择训练评分", 
                        variant: "destructive" 
                      });
                      return;
                    }
                    
                    const sessionData = {
                      type: selectedSessionType,
                      duration: isGuidedTraining ? guidedElapsedTime : customElapsedTime,
                      notes: isGuidedTraining ? guidedTrainingNotes : customTrainingNotes,
                      rating: parseInt(completionRating),
                      programId: selectedSessionType === "系统训练" ? mainProgram?.id : undefined
                    };
                    
                    completeSessionMutation.mutate(sessionData);
                    setShowTrainingComplete(false);
                    setCompletionRating("");
                  } catch (error) {
                    console.error("Submit training error:", error);
                    toast({ 
                      title: "提交失败", 
                      description: "请重试",
                      variant: "destructive"
                    });
                  }
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