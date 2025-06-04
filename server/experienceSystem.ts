// Experience System Architecture for Billiards Training Platform

interface ExperienceConfig {
  // Base experience values
  baseTrainingExp: number;
  baseLevelExp: number;
  baseCustomTrainingExp: number;
  
  // Multipliers
  difficultyMultipliers: Record<string, number>;
  durationMultipliers: Record<string, number>;
  ratingMultipliers: Record<number, number>;
  
  // Level progression
  expPerLevel: number;
  maxLevel: number;
}

export const experienceConfig: ExperienceConfig = {
  // Base experience points
  baseTrainingExp: 50,        // Base XP for completing guided training
  baseLevelExp: 100,          // Base XP for completing level map exercises
  baseCustomTrainingExp: 30,  // Base XP for custom training sessions
  
  // Difficulty multipliers
  difficultyMultipliers: {
    "新手": 1.0,
    "初级": 1.0,
    "进阶": 1.5,
    "中级": 1.5,
    "高级": 2.0,
    "专业": 2.5
  },
  
  // Duration-based multipliers (in minutes)
  durationMultipliers: {
    "short": 0.8,    // < 10 minutes
    "normal": 1.0,   // 10-30 minutes
    "long": 1.3,     // 30-60 minutes
    "extended": 1.5  // > 60 minutes
  },
  
  // Rating-based multipliers (1-5 stars)
  ratingMultipliers: {
    1: 0.6,
    2: 0.8,
    3: 1.0,
    4: 1.2,
    5: 1.5
  },
  
  // Level progression
  expPerLevel: 1000,
  maxLevel: 50
};

export function calculateTrainingExperience(params: {
  sessionType: "guided" | "custom";
  duration: number; // in seconds
  rating?: number;
  difficulty?: string;
  programDifficulty?: string;
}): number {
  const { sessionType, duration, rating, difficulty, programDifficulty } = params;
  
  // Base experience based on session type
  let baseExp = sessionType === "guided" 
    ? experienceConfig.baseTrainingExp 
    : experienceConfig.baseCustomTrainingExp;
  
  // Duration multiplier
  const durationMinutes = Math.floor(duration / 60);
  let durationMultiplier = 1.0;
  
  if (durationMinutes < 10) {
    durationMultiplier = experienceConfig.durationMultipliers.short;
  } else if (durationMinutes <= 30) {
    durationMultiplier = experienceConfig.durationMultipliers.normal;
  } else if (durationMinutes <= 60) {
    durationMultiplier = experienceConfig.durationMultipliers.long;
  } else {
    durationMultiplier = experienceConfig.durationMultipliers.extended;
  }
  
  // Difficulty multiplier
  const selectedDifficulty = difficulty || programDifficulty || "新手";
  const difficultyMultiplier = experienceConfig.difficultyMultipliers[selectedDifficulty] || 1.0;
  
  // Rating multiplier
  const ratingMultiplier = rating 
    ? experienceConfig.ratingMultipliers[rating] || 1.0 
    : 1.0;
  
  // Calculate final experience
  const finalExp = Math.round(
    baseExp * durationMultiplier * difficultyMultiplier * ratingMultiplier
  );
  
  return Math.max(10, finalExp); // Minimum 10 XP
}

export function calculateLevelExperience(params: {
  level: number;
  difficulty: string;
  rating?: number;
  timeBonus?: boolean; // For completing quickly
}): number {
  const { level, difficulty, rating, timeBonus } = params;
  
  let baseExp = experienceConfig.baseLevelExp;
  
  // Level-based multiplier (higher levels give more XP)
  const levelMultiplier = 1 + (level - 1) * 0.1;
  
  // Difficulty multiplier
  const difficultyMultiplier = experienceConfig.difficultyMultipliers[difficulty] || 1.0;
  
  // Rating multiplier
  const ratingMultiplier = rating 
    ? experienceConfig.ratingMultipliers[rating] || 1.0 
    : 1.0;
  
  // Time bonus for quick completion
  const timeBonusMultiplier = timeBonus ? 1.2 : 1.0;
  
  const finalExp = Math.round(
    baseExp * levelMultiplier * difficultyMultiplier * ratingMultiplier * timeBonusMultiplier
  );
  
  return Math.max(20, finalExp); // Minimum 20 XP for level completion
}

export function calculateUserLevel(totalExp: number): {
  level: number;
  currentLevelExp: number;
  nextLevelExp: number;
  progress: number;
} {
  const { expPerLevel, maxLevel } = experienceConfig;
  
  const level = Math.min(
    Math.floor(totalExp / expPerLevel) + 1,
    maxLevel
  );
  
  const currentLevelExp = totalExp % expPerLevel;
  const nextLevelExp = expPerLevel;
  const progress = (currentLevelExp / nextLevelExp) * 100;
  
  return {
    level,
    currentLevelExp,
    nextLevelExp,
    progress: Math.round(progress * 10) / 10
  };
}

export function getExperienceBreakdown(params: {
  sessionType: "guided" | "custom";
  duration: number;
  rating?: number;
  difficulty?: string;
  programDifficulty?: string;
}): {
  baseExp: number;
  durationBonus: number;
  difficultyBonus: number;
  ratingBonus: number;
  totalExp: number;
  breakdown: string[];
} {
  const { sessionType, duration, rating, difficulty, programDifficulty } = params;
  
  const baseExp = sessionType === "guided" 
    ? experienceConfig.baseTrainingExp 
    : experienceConfig.baseCustomTrainingExp;
  
  const durationMinutes = Math.floor(duration / 60);
  let durationMultiplier = 1.0;
  
  if (durationMinutes < 10) {
    durationMultiplier = experienceConfig.durationMultipliers.short;
  } else if (durationMinutes <= 30) {
    durationMultiplier = experienceConfig.durationMultipliers.normal;
  } else if (durationMinutes <= 60) {
    durationMultiplier = experienceConfig.durationMultipliers.long;
  } else {
    durationMultiplier = experienceConfig.durationMultipliers.extended;
  }
  
  const selectedDifficulty = difficulty || programDifficulty || "新手";
  const difficultyMultiplier = experienceConfig.difficultyMultipliers[selectedDifficulty] || 1.0;
  const ratingMultiplier = rating ? experienceConfig.ratingMultipliers[rating] || 1.0 : 1.0;
  
  const durationBonus = Math.round(baseExp * (durationMultiplier - 1));
  const difficultyBonus = Math.round(baseExp * (difficultyMultiplier - 1));
  const ratingBonus = rating ? Math.round(baseExp * (ratingMultiplier - 1)) : 0;
  
  const totalExp = calculateTrainingExperience(params);
  
  const breakdown: string[] = [
    `基础经验: ${baseExp}`,
    ...(durationBonus !== 0 ? [`时长奖励: ${durationBonus > 0 ? '+' : ''}${durationBonus}`] : []),
    ...(difficultyBonus !== 0 ? [`难度奖励: ${difficultyBonus > 0 ? '+' : ''}${difficultyBonus}`] : []),
    ...(ratingBonus !== 0 ? [`评分奖励: ${ratingBonus > 0 ? '+' : ''}${ratingBonus}`] : [])
  ];
  
  return {
    baseExp,
    durationBonus,
    difficultyBonus,
    ratingBonus,
    totalExp,
    breakdown
  };
}

// Achievement-based experience bonuses
export const achievementExperience = {
  firstTraining: 100,        // Complete first training session
  streak7Days: 200,          // Train for 7 consecutive days
  streak30Days: 500,         // Train for 30 consecutive days
  completeLevel: 150,        // Complete all exercises in a level
  perfectRating: 50,         // Get 5-star rating
  longSession: 100,          // Train for over 1 hour
  allLevelsComplete: 1000,   // Complete all 8 levels
  trainingMaster: 2000,      // Complete all 30 episodes
};