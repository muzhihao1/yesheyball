interface ExerciseComplexity {
  level: number;
  exerciseNumber: number;
  complexityScore: number;
  difficultyCategory: "基础" | "中级" | "高级" | "专家";
  requiredAttempts: number;
  prerequisites: string[];
}

interface LearningPath {
  userId: string;
  currentLevel: number;
  recommendedExercises: number[];
  strengthAreas: string[];
  improvementAreas: string[];
  nextMilestone: {
    level: number;
    exercise: number;
    estimatedDays: number;
  };
}

export class AdaptiveLearningEngine {
  
  // Analyze exercise complexity based on requirement text
  analyzeExerciseComplexity(requirement: string): ExerciseComplexity {
    let complexityScore = 0;
    let difficultyCategory: "基础" | "中级" | "高级" | "专家" = "基础";
    let requiredAttempts = 1;
    
    // Extract number of required attempts
    const attemptsMatch = requirement.match(/连续完成(\d+)次/);
    if (attemptsMatch) {
      const attempts = parseInt(attemptsMatch[1]);
      requiredAttempts = attempts;
      
      // Score based on required attempts
      if (attempts <= 5) {
        complexityScore = 1;
        difficultyCategory = "基础";
      } else if (attempts <= 15) {
        complexityScore = 2;
        difficultyCategory = "中级";
      } else if (attempts <= 30) {
        complexityScore = 3;
        difficultyCategory = "高级";
      } else {
        complexityScore = 4;
        difficultyCategory = "专家";
      }
    }
    
    // "全部一次成功" is highest difficulty
    if (requirement.includes("全部一次成功")) {
      complexityScore = 4;
      difficultyCategory = "专家";
      requiredAttempts = 1;
    }
    
    return {
      level: 0,
      exerciseNumber: 0,
      complexityScore,
      difficultyCategory,
      requiredAttempts,
      prerequisites: []
    };
  }
  
  // Generate personalized learning path
  generateLearningPath(
    userId: string, 
    currentLevel: number, 
    userPerformance: { exerciseId: string; stars: number; attempts: number }[]
  ): LearningPath {
    
    // Analyze user's performance patterns
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];
    
    const avgStars = userPerformance.reduce((sum, p) => sum + p.stars, 0) / userPerformance.length;
    const avgAttempts = userPerformance.reduce((sum, p) => sum + p.attempts, 0) / userPerformance.length;
    
    if (avgStars >= 2.5) {
      strengthAreas.push("精确度控制");
    }
    if (avgAttempts <= 3) {
      strengthAreas.push("稳定性表现");
    }
    
    if (avgStars < 2) {
      improvementAreas.push("基础技术");
    }
    if (avgAttempts > 5) {
      improvementAreas.push("一致性练习");
    }
    
    // Recommend next exercises based on complexity progression
    const recommendedExercises = this.getRecommendedExercises(currentLevel, userPerformance);
    
    // Calculate next milestone
    const nextMilestone = this.calculateNextMilestone(currentLevel, userPerformance);
    
    return {
      userId,
      currentLevel,
      recommendedExercises,
      strengthAreas,
      improvementAreas,
      nextMilestone
    };
  }
  
  private getRecommendedExercises(
    currentLevel: number, 
    performance: { exerciseId: string; stars: number; attempts: number }[]
  ): number[] {
    const recommendations: number[] = [];
    
    // Find exercises with low performance for remedial practice
    const weakExercises = performance
      .filter(p => p.stars < 2 || p.attempts > 5)
      .map(p => parseInt(p.exerciseId.split('-')[1]))
      .slice(0, 3);
    
    recommendations.push(...weakExercises);
    
    // Add progressive difficulty exercises
    const completedCount = performance.length;
    const nextExercises = [];
    
    for (let i = completedCount + 1; i <= Math.min(completedCount + 3, 10); i++) {
      nextExercises.push(i);
    }
    
    recommendations.push(...nextExercises);
    
    return Array.from(new Set(recommendations)).slice(0, 5);
  }
  
  private calculateNextMilestone(
    currentLevel: number, 
    performance: { exerciseId: string; stars: number; attempts: number }[]
  ) {
    const avgPerformance = performance.reduce((sum, p) => sum + p.stars, 0) / performance.length;
    
    let estimatedDays = 7; // Default
    
    if (avgPerformance >= 2.5) {
      estimatedDays = 3; // Fast learner
    } else if (avgPerformance < 1.5) {
      estimatedDays = 14; // Needs more practice
    }
    
    return {
      level: currentLevel + 1,
      exercise: 1,
      estimatedDays
    };
  }
  
  // Get difficulty-based exercise recommendations
  getExercisesByDifficulty(
    targetDifficulty: "基础" | "中级" | "高级" | "专家",
    level: number
  ): number[] {
    // This would integrate with the exercise requirements data
    const exercises: number[] = [];
    
    // Mock implementation - in real app, this would analyze requirement complexity
    switch (targetDifficulty) {
      case "基础":
        exercises.push(1, 2, 4, 6, 8);
        break;
      case "中级":
        exercises.push(5, 7, 9, 11, 13);
        break;
      case "高级":
        exercises.push(10, 12, 15, 18, 20);
        break;
      case "专家":
        exercises.push(3, 16, 19, 22, 25); // "全部一次成功" exercises
        break;
    }
    
    return exercises.slice(0, 3);
  }
}

export const adaptiveLearning = new AdaptiveLearningEngine();
