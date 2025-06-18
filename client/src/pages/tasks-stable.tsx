import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, Play, Pause, Square, BookOpen } from "lucide-react";

export default function TasksStable() {
  const { toast } = useToast();
  
  // Training states
  const [isGuidedTraining, setIsGuidedTraining] = useState(false);
  const [isCustomTraining, setIsCustomTraining] = useState(false);
  const [guidedElapsedTime, setGuidedElapsedTime] = useState(0);
  const [customElapsedTime, setCustomElapsedTime] = useState(0);
  const [isGuidedPaused, setIsGuidedPaused] = useState(false);
  const [isCustomPaused, setIsCustomPaused] = useState(false);

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

  // Training control handlers
  const handleStartTraining = () => {
    if (isGuidedTraining || isCustomTraining) {
      toast({ 
        title: "无法开始训练", 
        description: "请先完成或取消当前训练",
        variant: "destructive"
      });
      return;
    }
    setIsGuidedTraining(true);
    setGuidedElapsedTime(0);
    setIsGuidedPaused(false);
  };

  const handleStartCustomTraining = () => {
    if (isGuidedTraining || isCustomTraining) {
      toast({ 
        title: "无法开始训练", 
        description: "请先完成或取消当前训练",
        variant: "destructive"
      });
      return;
    }
    setIsCustomTraining(true);
    setCustomElapsedTime(0);
    setIsCustomPaused(false);
  };

  const handleStopTraining = () => {
    setIsGuidedTraining(false);
    setIsCustomTraining(false);
    setGuidedElapsedTime(0);
    setCustomElapsedTime(0);
    setIsGuidedPaused(false);
    setIsCustomPaused(false);
    toast({ 
      title: "训练结束", 
      description: "训练已成功结束" 
    });
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
                      onClick={handleStopTraining}
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      完成训练
                    </Button>
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
                    onClick={handleStopTraining}
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    完成训练
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}