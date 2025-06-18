import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Play, Pause, Square, Clock, Target, CheckCircle, PlusCircle, FileText, Star } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TrainingProgram, TrainingDay, TrainingSession, TrainingNote } from "@shared/schema";

interface TrainingSessionWithDetails extends TrainingSession {
  program?: TrainingProgram;
  day?: TrainingDay;
}

export default function TrainingPage() {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStartTime, setTrainingStartTime] = useState<Date | null>(null);
  const [currentNotes, setCurrentNotes] = useState("");
  const [showCreateCustom, setShowCreateCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Fetch training programs
  const { data: programs = [], isLoading: programsLoading } = useQuery<TrainingProgram[]>({
    queryKey: ["/api/training-programs"],
  });

  // Fetch current training session
  const { data: currentSession, isLoading: sessionLoading } = useQuery<TrainingSessionWithDetails | null>({
    queryKey: ["/api/training-sessions/current"],
  });

  // Fetch training sessions history
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<TrainingSessionWithDetails[]>({
    queryKey: ["/api/training-sessions"],
  });

  // Fetch training days for selected program
  const { data: trainingDays = [] } = useQuery<TrainingDay[]>({
    queryKey: ["/api/training-programs", selectedProgram, "days"],
    enabled: !!selectedProgram,
  });

  // Fetch notes for current session
  const { data: sessionNotes = [] } = useQuery<TrainingNote[]>({
    queryKey: ["/api/training-sessions", currentSession?.id, "notes"],
    enabled: !!currentSession?.id,
  });

  // Create training session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("/api/training-sessions", "POST", sessionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      setShowCreateCustom(false);
      setCustomTitle("");
      setCustomDescription("");
    },
  });

  // Add training note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: number; content: string }) => {
      const response = await apiRequest(`/api/training-sessions/${sessionId}/notes`, "POST", { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions", currentSession?.id, "notes"] });
      setCurrentNotes("");
    },
  });

  // Complete training session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async ({ sessionId, duration, rating, notes }: { sessionId: number; duration: number; rating: number; notes?: string }) => {
      const response = await apiRequest(`/api/training-sessions/${sessionId}/complete`, "POST", { duration, rating, notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/training-sessions"] });
      setIsTraining(false);
      setTrainingStartTime(null);
    },
  });

  const startTraining = () => {
    setIsTraining(true);
    setTrainingStartTime(new Date());
  };

  const stopTraining = () => {
    if (currentSession && trainingStartTime) {
      const duration = Math.floor((new Date().getTime() - trainingStartTime.getTime()) / 60000); // minutes
      const rating = 4; // Default rating, could be made selectable
      completeSessionMutation.mutate({ 
        sessionId: currentSession.id, 
        duration, 
        rating,
        notes: sessionNotes.map(note => note.content).join('\n\n')
      });
    }
  };

  const addNote = () => {
    if (currentSession && currentNotes.trim()) {
      addNoteMutation.mutate({ sessionId: currentSession.id, content: currentNotes.trim() });
    }
  };

  const createGuidedSession = (programId: number, day: number) => {
    const program = programs.find(p => p.id === programId);
    const dayData = trainingDays.find(d => d.day === day);
    
    if (program && dayData) {
      createSessionMutation.mutate({
        userId: 1,
        programId,
        dayId: dayData.id,
        title: `第${day}天：${dayData.title}`,
        description: dayData.description,
        sessionType: "guided"
      });
    }
  };

  const createCustomSession = () => {
    if (customTitle.trim()) {
      createSessionMutation.mutate({
        userId: 1,
        title: customTitle,
        description: customDescription || null,
        sessionType: "custom"
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  };

  if (programsLoading || sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const mainProgram = programs.find(p => p.name === "耶氏台球学院系统教学");

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">训练中心</h1>
        <p className="text-gray-600">系统化台球训练，提升技能水平</p>
      </div>

      {currentSession ? (
        /* Active Training Session */
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Training Panel */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {currentSession.title}
                  </CardTitle>
                  <Badge variant={currentSession.sessionType === "guided" ? "default" : "secondary"}>
                    {currentSession.sessionType === "guided" ? "指导训练" : "自定义训练"}
                  </Badge>
                </div>
                {currentSession.description && (
                  <p className="text-gray-600 mt-2">{currentSession.description}</p>
                )}
              </CardHeader>
              <CardContent>
                {currentSession.day && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">训练目标</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {currentSession.day.objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                    
                    {currentSession.day.keyPoints && currentSession.day.keyPoints.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">重点要求</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {currentSession.day.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {currentSession.day.estimatedDuration && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        建议训练时长：{currentSession.day.estimatedDuration}分钟
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  {!isTraining ? (
                    <Button onClick={startTraining} className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      开始训练
                    </Button>
                  ) : (
                    <Button onClick={stopTraining} variant="destructive" className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      结束训练
                    </Button>
                  )}
                </div>

                {isTraining && trainingStartTime && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      正在训练中...
                      <span className="ml-auto">
                        已用时：{formatDuration(Math.floor((new Date().getTime() - trainingStartTime.getTime()) / 60000))}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Training Notes Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  训练笔记
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">添加训练心得</Label>
                    <Textarea
                      id="notes"
                      value={currentNotes}
                      onChange={(e) => setCurrentNotes(e.target.value)}
                      placeholder="记录训练过程中的感受、发现和改进点..."
                      className="mt-1"
                      rows={4}
                    />
                    <Button 
                      onClick={addNote} 
                      disabled={!currentNotes.trim() || addNoteMutation.isPending}
                      className="mt-2 w-full"
                      size="sm"
                    >
                      添加笔记
                    </Button>
                  </div>

                  {sessionNotes.length > 0 && (
                    <div>
                      <Label>训练记录</Label>
                      <ScrollArea className="h-48 mt-2">
                        <div className="space-y-2">
                          {sessionNotes.map((note) => (
                            <div key={note.id} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="text-gray-500 text-xs mb-1">
                                {new Date(note.timestamp).toLocaleTimeString()}
                              </div>
                              <div>{note.content}</div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Training Selection */
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Guided Training Program */}
          {mainProgram && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  耶氏台球学院系统教学
                </CardTitle>
                <p className="text-gray-600">{mainProgram.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>训练难度：</span>
                    <Badge variant="outline">{mainProgram.difficulty}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>总天数：</span>
                    <span>{mainProgram.totalDays}天</span>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="day-select">选择训练天数</Label>
                    <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: mainProgram.totalDays }, (_, i) => i + 1).map((day) => {
                          const dayData = trainingDays.find(d => d.day === day);
                          return (
                            <SelectItem key={day} value={day.toString()}>
                              第{day}天：{dayData?.title || "加载中..."}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {trainingDays.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {(() => {
                        const dayData = trainingDays.find(d => d.day === selectedDay);
                        return dayData ? (
                          <div>
                            <h4 className="font-medium mb-2">第{selectedDay}天：{dayData.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{dayData.description}</p>
                            {dayData.estimatedDuration && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                预计时长：{dayData.estimatedDuration}分钟
                              </div>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  <Button 
                    onClick={() => createGuidedSession(mainProgram.id, selectedDay)}
                    disabled={createSessionMutation.isPending}
                    className="w-full"
                  >
                    开始第{selectedDay}天训练
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Training */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-blue-600" />
                自定义训练
              </CardTitle>
              <p className="text-gray-600">创建个性化的训练内容</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-title">训练标题</Label>
                  <Input
                    id="custom-title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="例如：直线球精度训练"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="custom-description">训练描述（可选）</Label>
                  <Textarea
                    id="custom-description"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="描述训练内容、目标和重点..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={createCustomSession}
                  disabled={!customTitle.trim() || createSessionMutation.isPending}
                  className="w-full"
                >
                  创建训练
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Training History */}
      <Card>
        <CardHeader>
          <CardTitle>训练历史</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="text-center py-4">加载中...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>还没有训练记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.filter(s => s.completed).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{session.title}</h4>
                      <Badge variant={session.sessionType === "guided" ? "default" : "secondary"}>
                        {session.sessionType === "guided" ? "指导" : "自定义"}
                      </Badge>
                    </div>
                    {session.description && (
                      <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      {session.rating && (
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < (session.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div>{session.duration ? formatDuration(session.duration) : "未记录"}</div>
                    <div>{new Date(session.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}