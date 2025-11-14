import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Target, BookOpen, Video, Play } from "lucide-react";
import type { NinetyDayCurriculum } from "@/hooks/useNinetyDayTraining";

interface DayCurriculumCardProps {
  curriculum: NinetyDayCurriculum;
  isCompleted: boolean;
  isCurrent: boolean;
  onStartTraining?: () => void;
  disabled?: boolean;
}

/**
 * DayCurriculumCard Component
 *
 * Displays a single day's curriculum card with training details.
 * Shows completion status, training type, objectives, and action buttons.
 */
export function DayCurriculumCard({
  curriculum,
  isCompleted,
  isCurrent,
  onStartTraining,
  disabled = false,
}: DayCurriculumCardProps) {
  const getDifficultyColor = (difficulty: string | null) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    switch (difficulty) {
      case "初级":
        return "bg-green-100 text-green-800";
      case "中级":
        return "bg-yellow-100 text-yellow-800";
      case "高级":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrainingTypeColor = (type: string) => {
    switch (type) {
      case "系统":
        return "bg-blue-100 text-blue-800";
      case "专项":
        return "bg-purple-100 text-purple-800";
      case "测试":
        return "bg-orange-100 text-orange-800";
      case "理论":
        return "bg-teal-100 text-teal-800";
      case "考核":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={`
      transition-all duration-200
      ${isCurrent ? "ring-2 ring-primary shadow-lg" : ""}
      ${isCompleted ? "opacity-75" : ""}
      ${disabled ? "opacity-50" : "hover:shadow-md"}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-semibold">
                第 {curriculum.dayNumber} 天
              </Badge>
              <Badge className={getTrainingTypeColor(curriculum.trainingType)}>
                {curriculum.trainingType}训练
              </Badge>
              {curriculum.difficulty && (
                <Badge className={getDifficultyColor(curriculum.difficulty)}>
                  {curriculum.difficulty}
                </Badge>
              )}
              {curriculum.originalCourseRef && (
                <Badge variant="secondary" className="text-xs">
                  {curriculum.originalCourseRef}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : isCurrent ? (
                <Play className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              {curriculum.title}
            </CardTitle>
            {curriculum.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {curriculum.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Training Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {curriculum.estimatedDuration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{curriculum.estimatedDuration} 分钟</span>
            </div>
          )}
          {curriculum.videoUrl && (
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span>视频教学</span>
            </div>
          )}
        </div>

        {/* Training Objectives */}
        {curriculum.objectives && curriculum.objectives.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Target className="h-4 w-4 text-primary" />
              <span>训练目标</span>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {curriculum.objectives.slice(0, 3).map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="flex-1">{objective}</span>
                </li>
              ))}
              {curriculum.objectives.length > 3 && (
                <li className="text-xs italic">还有 {curriculum.objectives.length - 3} 项目标...</li>
              )}
            </ul>
          </div>
        )}

        {/* Key Points */}
        {curriculum.keyPoints && curriculum.keyPoints.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>重点内容</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {curriculum.keyPoints.slice(0, 4).map((point, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {point}
                </Badge>
              ))}
              {curriculum.keyPoints.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{curriculum.keyPoints.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t flex gap-2">
          {isCompleted ? (
            <Button variant="outline" size="sm" className="flex-1" disabled>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              已完成
            </Button>
          ) : (
            <>
              {isCurrent && !disabled && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={onStartTraining}
                >
                  <Play className="h-4 w-4 mr-1" />
                  开始训练
                </Button>
              )}
              {!isCurrent && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  disabled
                >
                  <Circle className="h-4 w-4 mr-1" />
                  {curriculum.dayNumber < (isCurrent ? curriculum.dayNumber : 999) ? "已解锁" : "待解锁"}
                </Button>
              )}
            </>
          )}
          {curriculum.videoUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(curriculum.videoUrl!, '_blank')}
            >
              <Video className="h-4 w-4 mr-1" />
              观看视频
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
