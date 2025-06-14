import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  Settings,
  Users,
  Flame,
  Zap,
  Trophy,
  Share,
  ChevronRight,
  Crown
} from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();
  
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/streak"],
    enabled: !!user,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/user-achievements"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      {/* Header */}
      <div className="relative pt-8 pb-6 px-4">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Settings className="h-6 w-6" />
          </Button>
        </div>
        
        {/* User Avatar and Info */}
        <div className="text-center mt-8">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-lg">
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback className="bg-purple-500 text-white text-2xl">
              {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {user.firstName || user.email?.split('@')[0]}
          </h1>
          
          <p className="text-gray-600 mt-1">
            @{user.email?.split('@')[0]} • 2024年加入
          </p>
          
          {/* Stats Row */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Crown className="h-4 w-4 text-purple-600" />
                <span className="text-lg font-bold text-gray-900">4</span>
              </div>
              <p className="text-sm text-gray-600">课程</p>
            </div>
            
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900">
                {achievements?.length || 0}
              </span>
              <p className="text-sm text-gray-600">关注</p>
            </div>
            
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900">12</span>
              <p className="text-sm text-gray-600">关注者</p>
            </div>
          </div>
          
          {/* Add Friend Button */}
          <div className="flex gap-3 mt-6">
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3">
              <Users className="h-4 w-4 mr-2" />
              添加好友
            </Button>
            <Button variant="outline" size="icon" className="p-3">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">概览</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Streak */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {userStats?.currentStreak || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600">连胜天数</p>
            </CardContent>
          </Card>

          {/* Total XP */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold text-gray-900">2480</span>
              </div>
              <p className="text-sm text-gray-600">总经验</p>
            </CardContent>
          </Card>

          {/* Current League */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-gray-900">翡翠石</span>
              </div>
              <p className="text-sm text-gray-600">等级</p>
            </CardContent>
          </Card>

          {/* Ranking */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">3</span>
              </div>
              <p className="text-sm text-gray-600">排名前3位</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Friend Leaderboard */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">友情连胜</h2>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="bg-red-500 text-white text-xs">L</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">M</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="bg-green-500 text-white text-xs">A</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="bg-purple-500 text-white text-xs">T</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="bg-orange-500 text-white text-xs">K</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-900">5人参与</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">19</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Menu */}
      <div className="px-4 pb-20">
        <h2 className="text-lg font-bold text-gray-900 mb-4">设置</h2>
        
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto text-left"
          >
            <span className="text-gray-900">偏好设置</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto text-left"
          >
            <span className="text-gray-900">个人档案</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto text-left"
          >
            <span className="text-gray-900">通知</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto text-left"
          >
            <span className="text-gray-900">隐私设置</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
        
        {/* Logout Button */}
        <div className="mt-8">
          <Button 
            variant="outline" 
            className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
            onClick={() => window.location.href = '/api/logout'}
          >
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}