import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";


import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  level: number;
  exp: number;
  streak: number;
  totalDays: number;
  completedTasks: number;
  totalTime: number;
  currentLevel?: number;
  currentExercise?: number;
  completedExercises?: Record<string, number>;
}

interface LevelStage {
  level: number;
  name: string;
  totalExercises: number;
  category: "启明星" | "超新星" | "智子星";
  description: string;
  unlocked: boolean;
  completed: boolean;
  progress: number;
  completedExercises: number;
  examPassed?: boolean;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: string;
  condition: any;
  expReward: number;
  category: "beginner" | "intermediate" | "advanced" | "master";
  unlocked: boolean;
  createdAt: string;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  progress: number;
  completed: boolean;
  unlockedAt: string;
  achievement: Achievement;
}

interface TrainingSession {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  duration: number | null;
  rating: number | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  sessionType: string;
  programId?: number | null;
  dayId?: number | null;
}

interface TrainingRecord {
  id: number;
  userId: number;
  title: string;
  content: string;
  duration: number | null;
  rating: number | null;
  completedAt: Date;
}

export default function GrowthPage() {

  // Fetch user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Fetch training sessions
  const { data: trainingSessions = [] } = useQuery<TrainingSession[]>({
    queryKey: ["/api/training-sessions"],
  });

  // Fetch training records
  const { data: trainingRecords = [] } = useQuery<TrainingRecord[]>({
    queryKey: ["/api/training-records"],
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  // Fetch user achievements
  const { data: userAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ["/api/user-achievements"],
  });

  // Fetch streak data
  const { data: streakData } = useQuery<{currentStreak: number; longestStreak: number; totalDays: number}>({
    queryKey: ["/api/user/streak"],
  });

  

  if (!user) {
    return <div>加载中...</div>;
  }

  
  
  // Calculate systematic training sessions (系统训练)
  const systematicTrainingSessions = trainingSessions.filter(session => 
    session.completed && (session as any).programId && session.sessionType === "guided"
  );
  const systematicTrainingCount = systematicTrainingSessions.length;
  
  const completedTraining = trainingSessions.filter(ts => ts.completed);
  
  // Fix total training time calculation (convert seconds to proper format)
  const totalTrainingTimeSeconds = completedTraining.reduce((sum, session) => sum + (session.duration || 0), 0);
  
  // Fix average rating calculation (exclude sessions without ratings)
  const ratedSessions = completedTraining.filter(session => session.rating && session.rating > 0);
  const avgRating = ratedSessions.length > 0 
    ? ratedSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / ratedSessions.length 
    : 0;

  const earnedAchievements = achievements.filter(a => userAchievements.some(ua => ua.achievementId === a.id && ua.completed));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-700">成长路径</h1>
        <p className="text-gray-600">追踪你的台球学习进展</p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{user.level - 1}</div>
            <div className="text-sm text-gray-500">已通关数</div>
            <div className="text-xs text-gray-400 mt-1">共8个等级</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{systematicTrainingCount}</div>
            <div className="text-sm text-gray-500">系统训练</div>
            <div className="text-xs text-gray-400 mt-1">共30集课程</div>
          </CardContent>
        </Card>



        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{earnedAchievements.length}</div>
            <div className="text-sm text-gray-500">获得成就</div>
            <div className="text-xs text-gray-400 mt-1">共{achievements.length}个成就</div>
          </CardContent>
        </Card>
      </div>

      {/* Training Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{completedTraining.length}</div>
            <div className="text-sm text-gray-500">训练次数</div>
            <div className="text-xs text-gray-400 mt-1">{avgRating > 0 ? `平均${avgRating.toFixed(1)}星` : '暂无评分'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{user.completedTasks || 0}</div>
            <div className="text-sm text-gray-500">练习次数</div>
            <div className="text-xs text-gray-400 mt-1">包含重复练习</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {Math.floor(totalTrainingTimeSeconds / 3600)}h {Math.floor((totalTrainingTimeSeconds % 3600) / 60)}m
            </div>
            <div className="text-sm text-gray-500">训练时长</div>
            <div className="text-xs text-gray-400 mt-1">累计练习时间</div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
}