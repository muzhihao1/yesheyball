import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Star, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DashboardSummary } from "@/hooks/useDashboardSummary";

interface PracticeFieldCardProps {
  data: DashboardSummary["practiceField"];
}

export function PracticeFieldCard({ data }: PracticeFieldCardProps) {
  const xpToNextLevel = data.nextLevelXP - data.currentXP;
  const progressPercentage = (data.currentXP / data.nextLevelXP) * 100;

  // Level tier labels
  const getLevelTier = (level: number) => {
    if (level <= 3) return { name: "启明星", color: "text-blue-600" };
    if (level <= 6) return { name: "超新星", color: "text-purple-600" };
    return { name: "智子星", color: "text-yellow-600" };
  };

  const tier = getLevelTier(data.currentLevel);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-purple-600" />
          练习场等级
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-purple-600">Lv.{data.currentLevel}</span>
              <span className={`text-sm font-medium ${tier.color}`}>{tier.name}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">当前等级</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium text-gray-900">{data.currentXP}</div>
            <p className="text-xs text-gray-600">经验值</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">升级进度</span>
            <span className="font-medium text-purple-600">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-gray-500 text-center">
            距离下一级还需 <span className="font-medium text-purple-600">{xpToNextLevel}</span> 经验值
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white/50 rounded p-2">
            <Star className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-gray-600">8级成长体系</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/50 rounded p-2">
            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
            <span className="text-gray-600">持续进步中</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
