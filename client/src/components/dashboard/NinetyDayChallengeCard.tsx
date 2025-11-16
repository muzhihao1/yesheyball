import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DashboardSummary } from "@/hooks/useDashboardSummary";

interface NinetyDayChallengeCardProps {
  data: DashboardSummary["ninetyDayChallenge"];
}

export function NinetyDayChallengeCard({ data }: NinetyDayChallengeCardProps) {
  const progressPercentage = (data.completedDays / data.totalDays) * 100;
  const isStarted = data.startDate !== null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-blue-600" />
          90天挑战进度
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isStarted ? (
          <div className="text-center py-4">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">尚未开始90天挑战</p>
            <p className="text-xs text-gray-500 mt-1">前往【挑战】页面开启训练之旅</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{data.currentDay}</div>
                <p className="text-xs text-gray-600">当前天数</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{data.completedDays}</div>
                <p className="text-xs text-gray-600">已完成</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{data.totalDays - data.completedDays}</div>
                <p className="text-xs text-gray-600">剩余天数</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">总进度</span>
                <span className="font-medium text-blue-600">{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {data.daysSinceStart !== null && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 rounded-lg p-2">
                <TrendingUp className="h-4 w-4" />
                <span>已坚持 {data.daysSinceStart} 天</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
