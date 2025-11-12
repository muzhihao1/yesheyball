import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, Award, Play } from "lucide-react";
import type { NinetyDaySpecializedTraining } from "@/hooks/useNinetyDayTraining";

interface SpecializedTrainingCardProps {
  training: NinetyDaySpecializedTraining;
  onStartTraining?: () => void;
  disabled?: boolean;
}

/**
 * SpecializedTrainingCard Component
 *
 * 专项训练卡片 - 独立展示区域的卡片组件
 * 用于展示单个专项训练项目（五分点、力度、分离角等）
 */
export function SpecializedTrainingCard({
  training,
  onStartTraining,
  disabled = false,
}: SpecializedTrainingCardProps) {
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "五分点": "bg-blue-100 text-blue-800",
      "力度": "bg-purple-100 text-purple-800",
      "分离角": "bg-orange-100 text-orange-800",
      "走位": "bg-teal-100 text-teal-800",
      "薄球": "bg-pink-100 text-pink-800",
      "加塞": "bg-indigo-100 text-indigo-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // 获取关联的十大招技能名称
  const getRelatedSkills = () => {
    if (!training.relatedTencoreSkills || training.relatedTencoreSkills.length === 0) {
      return null;
    }
    return training.relatedTencoreSkills.map((num) => `第${num}招`).join("、");
  };

  return (
    <Card className={`
      transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(training.category)}>
                {training.category}
              </Badge>
              {training.difficulty && (
                <Badge className={getDifficultyColor(training.difficulty)}>
                  {training.difficulty}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{training.name}</CardTitle>
          </div>
          <Target className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {training.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {training.description}
          </p>
        )}

        {/* Training Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{training.estimatedDuration} 分钟</span>
          </div>
          {getRelatedSkills() && (
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span className="text-xs">{getRelatedSkills()}</span>
            </div>
          )}
        </div>

        {/* Training Method Preview */}
        {training.trainingMethod && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground font-medium mb-1">训练方法</p>
            <p className="text-sm line-clamp-3">{training.trainingMethod}</p>
          </div>
        )}

        {/* Evaluation Criteria */}
        {training.evaluationCriteria && Object.keys(training.evaluationCriteria).length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">评估标准</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(training.evaluationCriteria).slice(0, 3).map(([level, _]) => (
                <Badge key={level} variant="outline" className="text-xs">
                  {level}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={onStartTraining}
          disabled={disabled}
          className="w-full"
          size="sm"
        >
          <Play className="h-4 w-4 mr-1" />
          开始训练
        </Button>
      </CardContent>
    </Card>
  );
}
