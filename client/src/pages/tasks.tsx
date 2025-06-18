import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Play, Pause, Square, BookOpen, Target, Zap } from "lucide-react";

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
    setIsGuidedTraining(true);
    setGuidedElapsedTime(0);
    setIsGuidedPaused(false);
    toast({ 
      title: "系统训练开始", 
      description: "第1集：握杆基础训练已开始" 
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
    setIsSpecialTraining(true);
    setSpecialElapsedTime(0);
    setIsSpecialPaused(false);
    toast({ 
      title: "特训开始", 
      description: "专注于力度和准度的针对性训练" 
    });
  };

  const handleStopTraining = () => {
    const wasGuided = isGuidedTraining;
    const wasCustom = isCustomTraining;
    const wasSpecial = isSpecialTraining;
    
    setIsGuidedTraining(false);
    setIsCustomTraining(false);
    setIsSpecialTraining(false);
    setGuidedElapsedTime(0);
    setCustomElapsedTime(0);
    setSpecialElapsedTime(0);
    setIsGuidedPaused(false);
    setIsCustomPaused(false);
    setIsSpecialPaused(false);
    
    toast({ 
      title: "训练结束", 
      description: wasGuided ? "系统训练已完成" : wasCustom ? "自主训练已完成" : wasSpecial ? "特训已完成" : "训练已结束"
    });
  };

  // Safe data access
  const currentDay = 1;
  const currentEpisode = `第${currentDay}集`;
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
              <Badge className="bg-green-100 text-green-800 text-xs">
                初级
              </Badge>
              <Badge variant="outline" className="text-xs">
                第1周
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              第1集：握杆基础
            </h3>
            <p className="text-gray-600 mb-4">
              学习正确的握杆姿势和基本击球技巧，为后续训练打下坚实基础。
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
                <div className="flex items-center justify-between p-4 bg-purple-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span className="font-mono text-lg">{formatTime(specialElapsedTime)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsSpecialPaused(!isSpecialPaused)}
                      variant="outline"
                      size="sm"
                    >
                      {isSpecialPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={handleStopTraining}
                      variant="default"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      完成特训
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