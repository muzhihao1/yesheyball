import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UserTask, Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DIFFICULTY_COLORS } from "@/lib/tasks";
import { apiRequest, queryClient } from "@/lib/queryClient";
import FeedbackModal from "@/components/feedback-modal";
import { useToast } from "@/hooks/use-toast";

interface TaskWithData extends UserTask {
  task: Task;
}

interface TaskCompletion {
  userTask: UserTask;
  feedback: {
    feedback: string;
    encouragement: string;
    tips: string;
    rating: number;
  };
}

interface DailyCourse {
  day: number;
  title: string;
  description: string;
  week: number;
  category: string;
  difficulty: "初级" | "中级" | "高级";
}

export default function Tasks() {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();

  const { data: todayTasks, isLoading } = useQuery<TaskWithData[]>({
    queryKey: ["/api/user/tasks/today"],
  });

  const { data: dailyCourse, isLoading: courseLoading } = useQuery<DailyCourse>({
    queryKey: ["/api/daily-course/today"],
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, rating }: { taskId: number; rating: number }) => {
      const response = await apiRequest("POST", `/api/user/tasks/${taskId}/complete`, { rating });
      return response.json() as Promise<TaskCompletion>;
    },
    onSuccess: (data) => {
      setFeedbackData(data.feedback);
      setShowFeedback(true);
      queryClient.invalidateQueries({ queryKey: ["/api/user/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "任务完成！",
        description: "恭喜你完成了今天的训练任务！",
      });
    },
    onError: () => {
      toast({
        title: "完成失败",
        description: "任务完成时出现错误，请重试。",
        variant: "destructive",
      });
    },
  });

  const handleCompleteTask = (taskId: number) => {
    if (userRating === 0) {
      toast({
        title: "请先评分",
        description: "请为你的训练表现打分后再完成任务。",
        variant: "destructive",
      });
      return;
    }
    
    completeTaskMutation.mutate({ taskId, rating: userRating });
    setSelectedTaskId(null);
    setUserRating(0);
  };

  const handleStartTask = (taskId: number) => {
    setSelectedTaskId(taskId);
    setUserRating(0);
  };

  const renderStars = (rating: number, interactive: boolean = false, taskId?: number) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-xl cursor-pointer transition-colors ${
          index < rating ? 'text-trophy-gold' : 'text-gray-300'
        } ${interactive ? 'hover:text-trophy-gold' : ''}`}
        onClick={interactive ? () => setUserRating(index + 1) : undefined}
      >
        ⭐
      </span>
    ));
  };

  if (isLoading || courseLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-48 h-8 skeleton mx-auto mb-4"></div>
          <div className="w-64 h-6 skeleton mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-96 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!todayTasks) {
    return <div className="text-center py-8">加载任务失败</div>;
  }

  const completedTasks = todayTasks.filter(t => t.completed).length;
  const progressPercentage = (completedTasks / todayTasks.length) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-700 mb-2">每日训练</h2>
        <p className="text-gray-600">王孟52集台球教学系统训练</p>
        <div className="inline-flex items-center bg-green-100 rounded-full px-4 py-2 mt-4">
          <span className="mr-2">📅</span>
          <span className="text-green-700 font-medium">{new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* Today's Course */}
      {dailyCourse && (
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-green-700 flex items-center">
                <span className="mr-2">📚</span>
                今日课程：第{dailyCourse.day}天
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={DIFFICULTY_COLORS[dailyCourse.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                  {dailyCourse.difficulty}
                </Badge>
                <Badge variant="outline">第{dailyCourse.week}周</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{dailyCourse.title}</h3>
            <p className="text-gray-700 mb-4">{dailyCourse.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">课程类别: {dailyCourse.category}</span>
              <Button variant="outline" size="sm">
                观看教学视频
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>今日进度</span>
            <Badge variant={completedTasks === todayTasks.length ? "default" : "secondary"}>
              {completedTasks}/{todayTasks.length} 完成
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3 mb-4" />
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-trophy-gold">+{completedTasks * 15}</div>
              <div className="text-gray-500">经验值</div>
            </div>
            <div>
              <div className="font-bold text-blue-500">
                {completedTasks > 0 ? '✓' : '○'}
              </div>
              <div className="text-gray-500">今日打卡</div>
            </div>
            <div>
              <div className="font-bold text-green-500">
                {progressPercentage === 100 ? '+1' : '0'}
              </div>
              <div className="text-gray-500">完成奖励</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {todayTasks.map((taskData) => (
          <Card 
            key={taskData.id} 
            className={`overflow-hidden hover:shadow-xl transition-shadow ${
              taskData.completed 
                ? 'bg-green-50 border-green-200' 
                : selectedTaskId === taskData.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : ''
            }`}
          >
            {taskData.task.imageUrl && (
              <img 
                src={taskData.task.imageUrl} 
                alt={taskData.task.title}
                className="w-full h-48 object-cover"
              />
            )}
            
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg text-green-700">
                  {taskData.task.title}
                </CardTitle>
                <div className="flex">
                  {renderStars(taskData.rating || 0)}
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={DIFFICULTY_COLORS[taskData.task.difficulty as keyof typeof DIFFICULTY_COLORS]}
              >
                {taskData.task.difficulty}
              </Badge>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                {taskData.task.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-500 flex items-center">
                  <span className="mr-1">🎯</span>
                  {taskData.task.category}
                </div>
                <div className="text-xs text-gray-500">
                  等级 {taskData.task.level}
                </div>
              </div>

              {taskData.completed ? (
                <div className="text-center">
                  <div className="flex items-center justify-center text-green-600 mb-2">
                    <span className="mr-2">✅</span>
                    <span className="font-medium">已完成</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {taskData.completedAt && new Date(taskData.completedAt).toLocaleTimeString('zh-CN')}
                  </div>
                </div>
              ) : selectedTaskId === taskData.id ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">为你的表现评分：</p>
                    <div className="flex justify-center">
                      {renderStars(userRating, true, taskData.id)}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedTaskId(null);
                        setUserRating(0);
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-billiards-green hover:bg-green-700"
                      onClick={() => handleCompleteTask(taskData.id)}
                      disabled={userRating === 0 || completeTaskMutation.isPending}
                    >
                      {completeTaskMutation.isPending ? "完成中..." : "完成"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full bg-billiards-green hover:bg-green-700"
                  onClick={() => handleStartTask(taskData.id)}
                >
                  开始练习
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Bonus */}
      {progressPercentage === 100 && (
        <Card className="gradient-trophy text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">🎉 今日任务全部完成！</h3>
            <p className="mb-4">恭喜你完成了所有训练任务，获得额外奖励！</p>
            <div className="flex justify-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold">+50</div>
                <div className="text-xs">奖励经验</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">+1</div>
                <div className="text-xs">连击天数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        feedback={feedbackData}
        userRating={userRating}
        expGained={userRating * 5}
      />
    </div>
  );
}
