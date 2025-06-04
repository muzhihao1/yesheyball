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

export default function Tasks() {
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [trainingNotes, setTrainingNotes] = useState("");
  const [showTrainingComplete, setShowTrainingComplete] = useState(false);
  const [showCustomTraining, setShowCustomTraining] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [selectedSessionType, setSelectedSessionType] = useState("系统训练");

  const { toast } = useToast();

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
    mutationFn: (sessionId: number) => 
      apiRequest(`/api/training-sessions/${sessionId}/complete`, "POST", { 
        notes: trainingNotes, 
        rating: userRating, 
        duration: elapsedTime 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-programs"] });
      setShowTrainingComplete(false);
      setIsTraining(false);
      setElapsedTime(0);
      setTrainingNotes("");
      setUserRating(0);
      // Progress to next episode
      nextEpisodeMutation.mutate();
      toast({ title: "训练完成", description: "您的训练记录已保存，进入下一集" });
    }
  });

  // Start custom training mutation
  const startCustomTrainingMutation = useMutation({
    mutationFn: () => 
      apiRequest("/api/training-sessions", "POST", {
        title: customTitle,
        description: customDescription,
        sessionType: selectedSessionType
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions/current"] });
      setShowCustomTraining(false);
      setCustomTitle("");
      setCustomDescription("");
      toast({ title: "训练开始", description: "自定义训练已开始" });
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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTraining && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTraining, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setIsPaused(false);
    setElapsedTime(0);
  };

  const handlePauseTraining = () => {
    setIsPaused(!isPaused);
  };

  const handleStopTraining = () => {
    setShowTrainingComplete(true);
  };

  const handleCompleteTraining = () => {
    if (currentSession) {
      completeSessionMutation.mutate(currentSession.id);
    }
  };

  const getDifficultyBadge = (day: number) => {
    if (day <= 17) return { label: "初级", color: "bg-green-100 text-green-800" };
    if (day <= 34) return { label: "中级", color: "bg-yellow-100 text-yellow-800" };
    return { label: "高级", color: "bg-red-100 text-red-800" };
  };

  const beginner51Program = programs.find(p => p.name === "新手指导计划");
  const currentDay = beginner51Program?.currentDay || 1;
  const currentEpisode = `第${currentDay}集`;
  const difficultyBadge = getDifficultyBadge(currentDay);

  const completedSessions = sessions.filter(s => s.completed);
  const todayProgress = completedSessions.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-700">训练计划</h1>
        <p className="text-gray-600">耶氏台球学院系统教学 · 共30集</p>
        <div className="flex items-center justify-center text-gray-500">
          <Calendar className="h-5 w-5 mr-2" />
          {new Date().toLocaleDateString('zh-CN')}
        </div>
      </div>

      {/* Current Episode */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-green-600" />
              <span className="text-lg font-medium">今日课程：{currentEpisode}</span>
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
            <h3 className="text-xl font-semibold mb-2">{currentSession?.title || `${currentEpisode}：基础技能训练`}</h3>
            <p className="text-gray-600 mb-4">
              {currentSession?.description || "进一步掌握基础击球技巧，提升准度和稳定性。"}
            </p>
            <div className="text-sm text-gray-500 mb-4">
              课程类别：基础训练
            </div>
          </div>

          {/* Training Controls */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-mono text-green-600">
                {formatTime(elapsedTime)}
              </div>
              <div className="flex space-x-2">
                {!isTraining ? (
                  <Button onClick={handleStartTraining} className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    开始训练
                  </Button>
                ) : (
                  <>
                    <Button onClick={handlePauseTraining} variant="outline">
                      {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                      {isPaused ? "继续" : "暂停"}
                    </Button>
                    <Button onClick={handleStopTraining} variant="destructive">
                      <Square className="h-4 w-4 mr-2" />
                      结束训练
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isTraining && (
              <div className="space-y-3">
                <Label htmlFor="notes">训练笔记</Label>
                <Textarea
                  id="notes"
                  placeholder="记录训练感受、技巧心得或遇到的问题..."
                  value={trainingNotes}
                  onChange={(e) => setTrainingNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowCustomTraining(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              自定义训练
            </Button>
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
                <div className="text-2xl font-bold text-yellow-500">0</div>
                <div className="text-sm text-gray-500">经验值</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">0</div>
                <div className="text-sm text-gray-500">今日打卡</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">0</div>
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
                <div key={record.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{record.title}</h4>
                      <p className="text-gray-600 mt-1">{record.content}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(record.completedAt).toLocaleDateString('zh-CN')}
                        {record.duration && (
                          <div className="ml-4 flex items-center">
                            <span className="mr-1">⏱️</span>
                            {Math.floor(record.duration / 60)}分钟
                          </div>
                        )}
                        {record.rating && (
                          <div className="ml-4 flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {record.rating}/5
                          </div>
                        )}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>训练完成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-gray-600">本次训练时长</p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="final-notes">训练总结</Label>
              <Textarea
                id="final-notes"
                placeholder="总结本次训练的收获和感受..."
                value={trainingNotes}
                onChange={(e) => setTrainingNotes(e.target.value)}
                className="min-h-[100px]"
              />
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

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowTrainingComplete(false)}>
                继续训练
              </Button>
              <Button 
                onClick={handleCompleteTraining}
                disabled={completeSessionMutation.isPending}
                className="flex-1"
              >
                保存并完成
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Training Dialog */}
      <Dialog open={showCustomTraining} onOpenChange={setShowCustomTraining}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建自定义训练</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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