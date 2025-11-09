/**
 * Type definitions for the application
 * These types should match the database schema types from shared/schema.ts
 */

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: string;
  condition: Record<string, any>;
  expReward: number;
  category: string;
  unlocked: boolean;
  createdAt: Date;
}

export interface UserAchievement {
  id: number;
  userId: string;
  achievementId: number;
  unlockedAt: Date;
  progress: number;
  completed: boolean;
}
