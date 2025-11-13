/**
 * Tasks/Training Plan Page - Ten Core Skills System
 *
 * 训练计划页面 - 十大招系统
 * 复用原有UI组件，使用skills_v3数据源
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { TrainingCompleteModal } from "@/components/TrainingCompleteModal";
import { RatingModal } from "@/components/RatingModal";
import { AiFeedbackModal } from "@/components/AiFeedbackModal";
import { AchievementUnlockModal } from "@/components/AchievementUnlockModal";
import { DailyGoalsPanel } from "@/components/DailyGoalsPanel";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Play, Pause, Square, Target, Star, TrendingUp, ChevronRight } from "lucide-react";
import {
  useSkillsV3,
  useUserSkillProgressV3,
  useUserUnitCompletions,
  type SkillV3,
  type SubSkillV3,
  type TrainingUnitV3,
} from "@/hooks/useSkillsV3";

// Helper function to format time
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function TasksPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Navigation state - which skill/subskill is currently selected
  const [selectedSkill, setSelectedSkill] = useState<SkillV3 | null>(null);
  const [selectedSubSkill, setSelectedSubSkill] = useState<SubSkillV3 | null>(null);

  // Training states
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [activeElapsedTime, setActiveElapsedTime] = useState(0);
  const [isTrainingPaused, setIsTrainingPaused] = useState(false);
  const [activeUnit, setActiveUnit] = useState<TrainingUnitV3 | null>(null);
  const [trainingNotes, setTrainingNotes] = useState("");

  // Modal states
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    sessionTitle: string;
    earnedExp: number;
    stars: number;
    duration: number;
  } | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAiFeedbackModal, setShowAiFeedbackModal] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Fetch ten core skills data
  const { data: skills = [], isLoading: skillsLoading } = useSkillsV3();
  const { data: userProgress = [], isLoading: progressLoading } = useUserSkillProgressV3();
  const { data: allCompletions = [] } = useUserUnitCompletions();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTrainingActive && !isTrainingPaused) {
      interval = setInterval(() => {
        setActiveElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTrainingActive, isTrainingPaused]);

  // Calculate overall stats
  const totalSkills = skills.length;
  const completedSkills = userProgress.filter((p) => p.completedSubSkills >= 3).length;
  const totalXP = userProgress.reduce((sum, p) => sum + p.totalXpEarned, 0);
  const totalSubSkills = totalSkills * 3;
  const completedSubSkills = userProgress.reduce((sum, p) => sum + p.completedSubSkills, 0);
  const overallProgress = totalSubSkills > 0 ? Math.round((completedSubSkills / totalSubSkills) * 100) : 0;

  // Handle start training
  const handleStartTraining = (unit: TrainingUnitV3, skill: SkillV3, subSkill: SubSkillV3) => {
    setIsTrainingActive(true);
    setActiveUnit(unit);
    setActiveElapsedTime(0);
    setIsTrainingPaused(false);
    setTrainingNotes("");
    toast({
      title: "训练开始",
      description: `${skill.title} - ${subSkill.title} - ${unit.title}`,
    });
  };

  // Handle stop training
  const handleStopTraining = () => {
    if (!activeUnit) return;

    // Show rating modal
    setShowRatingModal(true);
  };

  // Handle rating submission
  const handleRatingSubmit = async (rating: number) => {
    setCurrentRating(rating);
    setShowRatingModal(false);

    // Show celebration first
    setCelebrationData({
      sessionTitle: activeUnit?.title || "训练",
      earnedExp: 50 + rating * 10,
      stars: rating,
      duration: activeElapsedTime,
    });
    setShowCelebration(true);

    // Generate AI feedback in background
    try {
      const response = await fetch("/api/coaching-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: activeElapsedTime,
          notes: trainingNotes || "完成了训练",
          rating: rating,
          sessionType: activeUnit?.title,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiFeedback(data.feedback);
        // AI feedback will be shown after celebration modal closes
      }
    } catch (error) {
      console.error("Failed to generate AI feedback:", error);
      // Continue even if AI feedback fails
    }

    // Reset training state
    setIsTrainingActive(false);
    setActiveUnit(null);
    setActiveElapsedTime(0);
    setTrainingNotes("");
  };

  // Loading state
  if (skillsLoading || progressLoading) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // No navigation selection - show skills overview
  if (!selectedSkill) {
    return (
      <div className="p-4 space-y-6 pb-24">
        {/* Daily Goals Panel */}
        <DailyGoalsPanel />

        {/* Ten Core Skills Header */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-lg text-blue-800">傅家俊十大招系统训练</CardTitle>
                  <p className="text-sm text-blue-700 mt-1">系统化技能提升路径</p>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white">
                {completedSkills} / {totalSkills} 完成
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Overall Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">总体进度</span>
                <span className="font-semibold text-blue-600">{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>{completedSubSkills} / {totalSubSkills} 子技能</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{totalXP} XP</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => {
            const progress = userProgress.find((p) => p.skillId === skill.id);
            const skillProgress = progress?.completedSubSkills || 0;
            const isCompleted = skillProgress >= 3;

            return (
              <Card
                key={skill.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                  isCompleted ? "border-green-300 bg-green-50/50" : "border-gray-200"
                }`}
                onClick={() => setSelectedSkill(skill)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <span>{skill.title}</span>
                        {isCompleted && <Badge className="bg-green-600 text-white text-xs">已完成</Badge>}
                      </CardTitle>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{skill.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>子技能进度</span>
                      <span className="font-semibold">{skillProgress} / 3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${(skillProgress / 3) * 100}%` }}
                      />
                    </div>
                    {progress && (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{progress.totalXpEarned} XP</span>
                        <span>{progress.completedUnits} 单元已完成</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modals */}
        <TrainingCompleteModal
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            // Show AI feedback after celebration if available
            if (aiFeedback) {
              setShowAiFeedbackModal(true);
            }
          }}
          celebrationData={celebrationData}
        />
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
        {showAiFeedbackModal && (
          <AiFeedbackModal
            onClose={() => {
              setShowAiFeedbackModal(false);
              setAiFeedback(""); // Clear feedback after closing
            }}
            feedback={aiFeedback}
            rating={currentRating}
          />
        )}
        <AchievementUnlockModal
          isOpen={showAchievementModal}
          onClose={() => setShowAchievementModal(false)}
          achievements={unlockedAchievements}
        />
      </div>
    );
  }

  // Skill selected - show sub-skills
  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Back button */}
      <Button variant="ghost" onClick={() => setSelectedSkill(null)} className="mb-4">
        ← 返回技能列表
      </Button>

      {/* Selected Skill Header */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle>{selectedSkill.title}</CardTitle>
          <p className="text-sm text-gray-600">{selectedSkill.description}</p>
        </CardHeader>
      </Card>

      {/* Sub-skills */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">子技能列表</h3>
        {selectedSkill.subSkills?.map((subSkill) => (
          <Card key={subSkill.id} className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">{subSkill.title}</CardTitle>
              <p className="text-sm text-gray-600">{subSkill.description}</p>
            </CardHeader>
            <CardContent>
              {/* Training units */}
              <div className="space-y-2">
                {subSkill.trainingUnits?.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{unit.title}</p>
                      <p className="text-xs text-gray-600">{unit.goalDescription}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartTraining(unit, selectedSkill, subSkill)}
                      disabled={isTrainingActive}
                    >
                      开始训练
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Training Interface */}
      {isTrainingActive && activeUnit && (
        <Card className="border-primary border-2">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Timer Display */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-mono text-2xl font-bold text-primary">
                      {formatTime(activeElapsedTime)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsTrainingPaused(!isTrainingPaused)}
                      variant="outline"
                      size="sm"
                    >
                      {isTrainingPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Training Notes */}
                <div className="p-4 bg-background rounded-lg border mb-4">
                  <h4 className="text-sm font-medium text-primary mb-2">训练心得记录</h4>
                  <Textarea
                    value={trainingNotes}
                    onChange={(e) => setTrainingNotes(e.target.value)}
                    placeholder="记录这次训练的收获、发现的问题或需要改进的地方..."
                    className="h-20 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setIsTrainingActive(false);
                      setActiveUnit(null);
                      setActiveElapsedTime(0);
                      setTrainingNotes("");
                      toast({
                        title: "训练已取消",
                        description: "记得下次继续加油！",
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    取消
                  </Button>
                  <Button onClick={handleStopTraining} className="flex-1">
                    完成训练
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <TrainingCompleteModal
        isOpen={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          // Show AI feedback after celebration if available
          if (aiFeedback) {
            setShowAiFeedbackModal(true);
          }
        }}
        celebrationData={celebrationData}
      />
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
      />
      {showAiFeedbackModal && (
        <AiFeedbackModal
          onClose={() => {
            setShowAiFeedbackModal(false);
            setAiFeedback(""); // Clear feedback after closing
          }}
          feedback={aiFeedback}
          rating={currentRating}
        />
      )}
      <AchievementUnlockModal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        achievements={unlockedAchievements}
      />
    </div>
  );
}
