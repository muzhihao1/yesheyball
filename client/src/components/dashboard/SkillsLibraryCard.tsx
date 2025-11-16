import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Clock, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DashboardSummary } from "@/hooks/useDashboardSummary";

interface SkillsLibraryCardProps {
  data: DashboardSummary["skillsLibrary"];
}

export function SkillsLibraryCard({ data }: SkillsLibraryCardProps) {
  const notStartedSkills = data.totalSkills - data.masteredSkills - data.inProgressSkills;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-green-600" />
          技能库成就
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.masteredSkills}</div>
            <p className="text-xs text-gray-600">已精通</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.inProgressSkills}</div>
            <p className="text-xs text-gray-600">学习中</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{notStartedSkills}</div>
            <p className="text-xs text-gray-600">未开始</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">总体进度</span>
            <span className="font-medium text-green-600">{data.overallProgress}%</span>
          </div>
          <Progress value={data.overallProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white/50 rounded p-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            <span className="text-gray-600">{data.masteredSkills}/{data.totalSkills} 核心技能</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/50 rounded p-2">
            <Target className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-gray-600">十大招系统</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
