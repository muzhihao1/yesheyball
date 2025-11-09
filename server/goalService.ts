/**
 * Daily Goals Service
 *
 * Handles generation, progress tracking, and reward distribution for daily goals.
 *
 * Features:
 * - Auto-generate 3 daily goals for users
 * - Track goal progress in real-time
 * - Grant experience rewards on completion
 * - Reset goals daily at midnight UTC
 */

import { db } from "./db.js";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import {
  goalTemplates,
  userDailyGoals,
  users,
  trainingSessions,
  type GoalTemplate,
  type UserDailyGoal,
  type InsertUserDailyGoal,
} from "../shared/schema.js";

/**
 * Goal Types and their configurations
 */
export interface GoalConfig {
  type: "SESSION_COUNT" | "TOTAL_DURATION" | "MIN_RATING";
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  targetValue: number;
  rewardXp: number;
}

const DAILY_GOAL_CONFIGS: GoalConfig[] = [
  // Session Count Goals
  {
    type: "SESSION_COUNT",
    description: "完成 {target} 次训练",
    difficulty: "EASY",
    targetValue: 1,
    rewardXp: 10,
  },
  {
    type: "SESSION_COUNT",
    description: "完成 {target} 次训练",
    difficulty: "MEDIUM",
    targetValue: 2,
    rewardXp: 20,
  },
  {
    type: "SESSION_COUNT",
    description: "完成 {target} 次训练",
    difficulty: "HARD",
    targetValue: 3,
    rewardXp: 30,
  },

  // Duration Goals
  {
    type: "TOTAL_DURATION",
    description: "累计训练 {target} 分钟",
    difficulty: "EASY",
    targetValue: 10,
    rewardXp: 10,
  },
  {
    type: "TOTAL_DURATION",
    description: "累计训练 {target} 分钟",
    difficulty: "MEDIUM",
    targetValue: 20,
    rewardXp: 20,
  },
  {
    type: "TOTAL_DURATION",
    description: "累计训练 {target} 分钟",
    difficulty: "HARD",
    targetValue: 30,
    rewardXp: 30,
  },

  // Rating Goals
  {
    type: "MIN_RATING",
    description: "完成1次评分达到 {target} 星的训练",
    difficulty: "MEDIUM",
    targetValue: 4,
    rewardXp: 15,
  },
  {
    type: "MIN_RATING",
    description: "完成1次评分达到 {target} 星的训练",
    difficulty: "HARD",
    targetValue: 5,
    rewardXp: 25,
  },
];

/**
 * Get start of today in UTC
 */
function getTodayUTC(): Date {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return today;
}

/**
 * Initialize goal templates in database
 */
export async function initializeGoalTemplates(): Promise<{ inserted: number; message: string }> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    // Check if templates already exist
    const existing = await db.select().from(goalTemplates).limit(1);

    if (existing.length > 0) {
      return {
        inserted: 0,
        message: "Goal templates already initialized",
      };
    }

    // Insert all goal configs as templates
    const templates = DAILY_GOAL_CONFIGS.map(config => ({
      type: config.type,
      description: config.description,
      difficulty: config.difficulty,
      rewardXp: config.rewardXp,
      active: true,
    }));

    await db.insert(goalTemplates).values(templates);

    return {
      inserted: templates.length,
      message: `Successfully initialized ${templates.length} goal templates`,
    };
  } catch (error) {
    console.error("Failed to initialize goal templates:", error);
    throw error;
  }
}

/**
 * Generate daily goals for a user
 * Selects 3 goals with balanced difficulty (1 easy, 1 medium, 1 hard)
 */
export async function generateUserGoals(userId: string, date?: Date): Promise<UserDailyGoal[]> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const targetDate = date || getTodayUTC();

  try {
    // Check if user already has goals for this date
    const existingGoals = await db
      .select()
      .from(userDailyGoals)
      .where(
        and(
          eq(userDailyGoals.userId, userId),
          eq(userDailyGoals.date, targetDate)
        )
      );

    if (existingGoals.length > 0) {
      return existingGoals;
    }

    // Get active templates for each difficulty
    const easyTemplates = await db
      .select()
      .from(goalTemplates)
      .where(and(eq(goalTemplates.difficulty, "EASY"), eq(goalTemplates.active, true)));

    const mediumTemplates = await db
      .select()
      .from(goalTemplates)
      .where(and(eq(goalTemplates.difficulty, "MEDIUM"), eq(goalTemplates.active, true)));

    const hardTemplates = await db
      .select()
      .from(goalTemplates)
      .where(and(eq(goalTemplates.difficulty, "HARD"), eq(goalTemplates.active, true)));

    if (easyTemplates.length === 0 || mediumTemplates.length === 0 || hardTemplates.length === 0) {
      throw new Error("Not enough goal templates initialized");
    }

    // Select one from each difficulty
    const selectedTemplates = [
      easyTemplates[Math.floor(Math.random() * easyTemplates.length)],
      mediumTemplates[Math.floor(Math.random() * mediumTemplates.length)],
      hardTemplates[Math.floor(Math.random() * hardTemplates.length)],
    ];

    // Create user daily goals
    const newGoals: InsertUserDailyGoal[] = selectedTemplates.map((template) => {
      const config = DAILY_GOAL_CONFIGS.find(
        c => c.type === template.type && c.difficulty === template.difficulty
      );

      return {
        userId,
        goalTemplateId: template.id,
        date: targetDate,
        targetValue: config?.targetValue || 1,
        currentValue: 0,
        isCompleted: false,
        completedAt: null,
      };
    });

    const insertedGoals = await db.insert(userDailyGoals).values(newGoals).returning();
    return insertedGoals;
  } catch (error) {
    console.error("Failed to generate user goals:", error);
    throw error;
  }
}

/**
 * Get user's daily goals for a specific date
 */
export async function getUserGoals(userId: string, date?: Date): Promise<UserDailyGoal[]> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const targetDate = date || getTodayUTC();

  try {
    const goals = await db
      .select()
      .from(userDailyGoals)
      .where(
        and(
          eq(userDailyGoals.userId, userId),
          eq(userDailyGoals.date, targetDate)
        )
      );

    // If no goals exist, generate them
    if (goals.length === 0) {
      return await generateUserGoals(userId, targetDate);
    }

    return goals;
  } catch (error) {
    console.error("Failed to get user goals:", error);
    throw error;
  }
}

/**
 * Update goal progress based on training session event
 */
export async function updateGoalProgress(
  userId: string,
  event: {
    type: "TRAINING_COMPLETED";
    duration: number; // in minutes
    rating: number | null;
  }
): Promise<UserDailyGoal[]> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const today = getTodayUTC();

  try {
    // Get user's today goals
    const goals = await getUserGoals(userId, today);
    const templates = await db.select().from(goalTemplates);

    const updatedGoals: UserDailyGoal[] = [];

    for (const goal of goals) {
      if (goal.isCompleted) {
        updatedGoals.push(goal);
        continue;
      }

      const template = templates.find(t => t.id === goal.goalTemplateId);
      if (!template) continue;

      let newValue = goal.currentValue;
      let isCompleted = false;

      // Update progress based on goal type
      switch (template.type) {
        case "SESSION_COUNT":
          newValue += 1;
          break;

        case "TOTAL_DURATION":
          newValue += event.duration;
          break;

        case "MIN_RATING":
          if (event.rating !== null && event.rating >= goal.targetValue) {
            newValue = 1;
          }
          break;
      }

      // Check if goal is now completed
      if (newValue >= goal.targetValue) {
        isCompleted = true;
        newValue = goal.targetValue; // Cap at target
      }

      // Update goal in database
      const updated = await db
        .update(userDailyGoals)
        .set({
          currentValue: newValue,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        })
        .where(eq(userDailyGoals.id, goal.id))
        .returning();

      if (updated[0]) {
        updatedGoals.push(updated[0]);

        // Grant reward if just completed
        if (isCompleted && !goal.isCompleted) {
          await grantCompletionReward(userId, template.rewardXp);
        }
      }
    }

    return updatedGoals;
  } catch (error) {
    console.error("Failed to update goal progress:", error);
    throw error;
  }
}

/**
 * Grant experience reward for completing a goal
 */
async function grantCompletionReward(userId: string, rewardXp: number): Promise<void> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    // Update user's experience
    await db
      .update(users)
      .set({
        exp: sql`${users.exp} + ${rewardXp}`,
      })
      .where(eq(users.id, userId));

    console.log(`Granted ${rewardXp} XP to user ${userId} for completing daily goal`);
  } catch (error) {
    console.error("Failed to grant completion reward:", error);
    throw error;
  }
}

/**
 * Get goals with template details (for frontend display)
 */
export async function getUserGoalsWithDetails(userId: string, date?: Date) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const targetDate = date || getTodayUTC();

  try {
    const goals = await getUserGoals(userId, targetDate);
    const templates = await db.select().from(goalTemplates);

    return goals.map(goal => {
      const template = templates.find(t => t.id === goal.goalTemplateId);
      const config = DAILY_GOAL_CONFIGS.find(
        c => c.type === template?.type && c.difficulty === template?.difficulty
      );

      // Replace {target} placeholder in description
      const description = template?.description.replace(
        "{target}",
        goal.targetValue.toString()
      ) || "";

      return {
        ...goal,
        template: {
          ...template,
          description,
        },
        config,
      };
    });
  } catch (error) {
    console.error("Failed to get goals with details:", error);
    throw error;
  }
}
