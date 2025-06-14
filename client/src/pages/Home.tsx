import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, Trophy, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback>
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                欢迎回来，{user?.firstName || user?.email || '学员'}！
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                继续您的台球训练之旅
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">当前等级</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Lv.{user?.level || 1}</div>
              <p className="text-xs text-muted-foreground">
                经验值: {user?.exp || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">连续训练</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.streak || 0}天</div>
              <p className="text-xs text-muted-foreground">
                总训练天数: {user?.totalDays || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">训练时长</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.totalTime || 0}分钟</div>
              <p className="text-xs text-muted-foreground">
                已完成任务: {user?.completedTasks || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Training Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/training">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>系统训练</CardTitle>
                <CardDescription>
                  30天系统课程，循序渐进提升技术
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/tasks">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>自主训练</CardTitle>
                <CardDescription>
                  选择练习项目，自由安排训练内容
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/special">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>特训模式</CardTitle>
                <CardDescription>
                  力量与准度专项训练
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/growth">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>成长记录</CardTitle>
                <CardDescription>
                  查看训练进度和成就解锁
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/diary">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>训练日记</CardTitle>
                <CardDescription>
                  记录训练心得和技术感悟
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/analysis">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>AI分析</CardTitle>
                <CardDescription>
                  上传训练视频，获得专业分析
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}