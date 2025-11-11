import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNinetyDayProgress, useNinetyDayStats, useTencoreSkills } from "@/hooks/useNinetyDayTraining";
import { TrendingUp, Target, Clock, Award } from "lucide-react";

/**
 * NinetyDayProgressBar Component
 *
 * Displays the user's overall progress through the 90-day training program.
 * Shows completion percentage, current day, time invested, and ten core skill progress.
 */
export function NinetyDayProgressBar() {
  const { data: progress, isLoading: progressLoading } = useNinetyDayProgress();
  const { data: skillsData, isLoading: skillsLoading } = useTencoreSkills();
  const stats = useNinetyDayStats(progress);

  if (progressLoading || skillsLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            90天训练进度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  const skills = skillsData?.skills || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            90天训练进度
          </div>
          <Badge variant={stats.isComplete ? "default" : "secondary"} className="text-sm">
            {stats.isComplete ? "已完成" : "进行中"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">总体进度</span>
            <span className="text-muted-foreground">
              {stats.daysCompleted} / 90 天 ({stats.completionPercentage}%)
            </span>
          </div>
          <Progress value={stats.completionPercentage} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>当前第 {stats.currentDay} 天</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>已训练 {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}min</span>
            </div>
          </div>
        </div>

        {/* Ten Core Skills Progress */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">十大招掌握度</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {skills.slice(0, 10).map((skill) => {
              const skillProgress = progress?.tencoreProgress?.[skill.skillNumber.toString()] || 0;
              return (
                <div key={skill.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium truncate max-w-[120px]" title={skill.skillName}>
                      {skill.skillNumber}. {skill.skillName}
                    </span>
                    <span className="text-muted-foreground">
                      {skillProgress}%
                    </span>
                  </div>
                  <Progress value={skillProgress} className="h-1.5" />
                </div>
              );
            })}
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">平均掌握度</span>
              <span className="text-primary font-semibold">{stats.avgSkillProgress}%</span>
            </div>
          </div>
        </div>

        {/* Encouragement Message */}
        {!stats.isComplete && stats.daysRemaining > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-center text-muted-foreground">
              {stats.daysRemaining <= 7 && "冲刺阶段！"}
              {stats.daysRemaining > 7 && stats.daysRemaining <= 30 && "坚持就是胜利！"}
              {stats.daysRemaining > 30 && "稳扎稳打，循序渐进"}
              还有 <span className="font-semibold text-foreground">{stats.daysRemaining}</span> 天即可完成全部课程。
            </p>
          </div>
        )}

        {stats.isComplete && (
          <div className="pt-4 border-t">
            <p className="text-sm text-center font-medium text-primary">
              🎉 恭喜完成90天训练计划！继续保持，精进球技！
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
