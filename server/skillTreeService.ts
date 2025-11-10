/**
 * Skill Tree Service
 * Handles skill tree data initialization and management
 */

import { db } from "./db.js";
import {
  skills,
  skillDependencies,
  skillUnlockConditions,
  userSkillProgress,
  users,
  trainingSessions,
  userAchievements,
  userDailyGoals
} from "../shared/schema.js";
import { eq, and, count } from "drizzle-orm";

/**
 * Skill tree seed data - 8 nodes aligned with 8-level growth path
 */
const SKILL_TREE_DATA = [
  {
    id: 1,
    name: "初窥门径",
    description: "掌握台球基础：正确的握杆、站位和基本击球姿势",
    position: { x: 400, y: 100 },
    metadata: { icon: "🌱", color: "#10b981", level: 1 },
    conditions: [], // Starting node - no conditions
  },
  {
    id: 2,
    name: "小有所成",
    description: "熟练运用手架技巧，建立稳定的瞄准系统",
    position: { x: 400, y: 250 },
    metadata: { icon: "🎯", color: "#3b82f6", level: 2 },
    conditions: [
      { type: "LEVEL", value: "2", count: 1, description: "达到等级 2" },
      { type: "COURSE", value: "5", count: 1, description: "完成 5 个训练课程" },
    ],
  },
  {
    id: 3,
    name: "渐入佳境",
    description: "掌握球控与走位，理解母球控制的基本原理",
    position: { x: 400, y: 400 },
    metadata: { icon: "⚡", color: "#8b5cf6", level: 3 },
    conditions: [
      { type: "LEVEL", value: "3", count: 1, description: "达到等级 3" },
      { type: "ACHIEVEMENT", value: "2", count: 1, description: "解锁【坚持训练】成就" },
      { type: "COURSE", value: "15", count: 1, description: "完成 15 个训练课程" },
    ],
  },
  {
    id: 4,
    name: "炉火纯青",
    description: "发力平顺流畅，能够稳定控制击球力度与节奏",
    position: { x: 400, y: 550 },
    metadata: { icon: "💫", color: "#ec4899", level: 4 },
    conditions: [
      { type: "LEVEL", value: "4", count: 1, description: "达到等级 4" },
      { type: "DAILY_GOAL", value: "10", count: 1, description: "完成 10 个每日目标" },
      { type: "COURSE", value: "25", count: 1, description: "完成 25 个训练课程" },
    ],
  },
  {
    id: 5,
    name: "登堂入室",
    description: "运用高级球技：塞球、低杆、高杆的精准控制",
    position: { x: 400, y: 700 },
    metadata: { icon: "🎓", color: "#f59e0b", level: 5 },
    conditions: [
      { type: "LEVEL", value: "5", count: 1, description: "达到等级 5" },
      { type: "ACHIEVEMENT", value: "5", count: 1, description: "解锁 5 个成就" },
      { type: "COURSE", value: "40", count: 1, description: "完成 40 个训练课程" },
    ],
  },
  {
    id: 6,
    name: "超群绝伦",
    description: "战术思维成熟，能够规划多杆走位与整体布局",
    position: { x: 400, y: 850 },
    metadata: { icon: "🏆", color: "#ef4444", level: 6 },
    conditions: [
      { type: "LEVEL", value: "6", count: 1, description: "达到等级 6" },
      { type: "ACHIEVEMENT", value: "8", count: 1, description: "解锁 8 个成就" },
      { type: "DAILY_GOAL", value: "30", count: 1, description: "完成 30 个每日目标" },
    ],
  },
  {
    id: 7,
    name: "登峰造极",
    description: "大师级技巧：复杂球型解决、精准控制、战术运用",
    position: { x: 400, y: 1000 },
    metadata: { icon: "👑", color: "#a855f7", level: 7 },
    conditions: [
      { type: "LEVEL", value: "7", count: 1, description: "达到等级 7" },
      { type: "ACHIEVEMENT", value: "12", count: 1, description: "解锁 12 个成就" },
      { type: "COURSE", value: "80", count: 1, description: "完成 80 个训练课程" },
    ],
  },
  {
    id: 8,
    name: "出神入化",
    description: "完美掌控台球艺术，融会贯通所有技术与战术",
    position: { x: 400, y: 1150 },
    metadata: { icon: "⭐", color: "#fbbf24", level: 8 },
    conditions: [
      { type: "LEVEL", value: "8", count: 1, description: "达到等级 8" },
      { type: "ACHIEVEMENT", value: "20", count: 1, description: "解锁所有 20 个成就" },
      { type: "DAILY_GOAL", value: "100", count: 1, description: "完成 100 个每日目标" },
      { type: "COURSE", value: "121", count: 1, description: "完成所有 121 个训练课程" },
    ],
  },
];

/**
 * Skill dependencies - linear path from skill 1 to 8
 */
const SKILL_DEPENDENCIES = [
  { source: 1, target: 2 },
  { source: 2, target: 3 },
  { source: 3, target: 4 },
  { source: 4, target: 5 },
  { source: 5, target: 6 },
  { source: 6, target: 7 },
  { source: 7, target: 8 },
];

/**
 * Initialize skill tree with seed data
 * This should only be called once during initial setup
 */
export async function initializeSkillTree() {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    // Check if skills already exist
    const existingSkills = await db.select().from(skills);

    if (existingSkills.length > 0) {
      return {
        inserted: 0,
        skipped: existingSkills.length,
        message: `Skill tree already initialized. Found ${existingSkills.length} existing skills.`,
      };
    }

    // Insert skills
    const insertedSkills = await db
      .insert(skills)
      .values(
        SKILL_TREE_DATA.map((skill) => ({
          name: skill.name,
          description: skill.description,
          position: skill.position,
          metadata: skill.metadata,
        }))
      )
      .returning();

    console.log(`Inserted ${insertedSkills.length} skills`);

    // Insert dependencies
    const insertedDependencies = await db
      .insert(skillDependencies)
      .values(
        SKILL_DEPENDENCIES.map((dep) => ({
          sourceSkillId: dep.source,
          targetSkillId: dep.target,
        }))
      )
      .returning();

    console.log(`Inserted ${insertedDependencies.length} skill dependencies`);

    // Insert unlock conditions
    let conditionCount = 0;
    for (const skill of SKILL_TREE_DATA) {
      if (skill.conditions.length > 0) {
        await db.insert(skillUnlockConditions).values(
          skill.conditions.map((condition) => ({
            skillId: skill.id,
            conditionType: condition.type,
            conditionValue: condition.value,
            requiredCount: condition.count,
            conditionDescription: condition.description,
          }))
        );
        conditionCount += skill.conditions.length;
      }
    }

    console.log(`Inserted ${conditionCount} unlock conditions`);

    return {
      inserted: insertedSkills.length,
      dependencies: insertedDependencies.length,
      conditions: conditionCount,
      message: `Successfully initialized skill tree with ${insertedSkills.length} skills, ${insertedDependencies.length} dependencies, and ${conditionCount} unlock conditions.`,
    };
  } catch (error) {
    console.error("Error initializing skill tree:", error);
    throw error;
  }
}

/**
 * Get all skills with their dependencies and conditions
 */
export async function getAllSkills() {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const allSkills = await db.select().from(skills).orderBy(skills.id);
    return allSkills;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
}

/**
 * Get skill dependencies
 */
export async function getSkillDependencies() {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const deps = await db.select().from(skillDependencies);
    return deps;
  } catch (error) {
    console.error("Error fetching skill dependencies:", error);
    throw error;
  }
}

/**
 * Get unlock conditions for a specific skill
 */
export async function getSkillUnlockConditions(skillId: number) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const conditions = await db
      .select()
      .from(skillUnlockConditions)
      .where(eq(skillUnlockConditions.skillId, skillId));
    return conditions;
  } catch (error) {
    console.error("Error fetching unlock conditions:", error);
    throw error;
  }
}

/**
 * Get user's unlocked skills
 */
export async function getUserUnlockedSkills(userId: string) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    const unlockedSkills = await db
      .select()
      .from(userSkillProgress)
      .where(eq(userSkillProgress.userId, userId));
    return unlockedSkills;
  } catch (error) {
    console.error("Error fetching user unlocked skills:", error);
    throw error;
  }
}

/**
 * Calculate progress for unlock conditions
 */
export async function calculateConditionProgress(
  userId: string,
  conditions: Array<{
    id: number;
    skillId: number;
    conditionType: string;
    conditionValue: string;
    requiredCount: number;
    conditionDescription: string | null;
  }>
) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    // Get user data
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      throw new Error("User not found");
    }

    const conditionsWithProgress = await Promise.all(
      conditions.map(async (condition) => {
        let currentProgress = 0;

        switch (condition.conditionType) {
          case "LEVEL": {
            // User's current level
            currentProgress = user.currentLevel || 0;
            break;
          }

          case "COURSE": {
            if (!db) break;
            // Count completed training sessions
            const result = await db
              .select({ count: count() })
              .from(trainingSessions)
              .where(eq(trainingSessions.userId, userId));
            currentProgress = result[0]?.count || 0;
            break;
          }

          case "ACHIEVEMENT": {
            if (!db) break;
            // Count unlocked achievements
            const result = await db
              .select({ count: count() })
              .from(userAchievements)
              .where(eq(userAchievements.userId, userId));
            currentProgress = result[0]?.count || 0;
            break;
          }

          case "DAILY_GOAL": {
            if (!db) break;
            // Count completed daily goals
            const result = await db
              .select({ count: count() })
              .from(userDailyGoals)
              .where(
                and(
                  eq(userDailyGoals.userId, userId),
                  eq(userDailyGoals.isCompleted, true)
                )
              );
            currentProgress = result[0]?.count || 0;
            break;
          }

          default:
            console.warn(`Unknown condition type: ${condition.conditionType}`);
        }

        // Check if condition is met
        const requiredValue = parseInt(condition.conditionValue);
        const isMet = currentProgress >= requiredValue;

        return {
          id: condition.id,
          type: condition.conditionType,
          value: condition.conditionValue,
          requiredCount: condition.requiredCount,
          description: condition.conditionDescription || "",
          currentProgress,
          isMet,
        };
      })
    );

    return conditionsWithProgress;
  } catch (error) {
    console.error("Error calculating condition progress:", error);
    throw error;
  }
}

/**
 * Unlock a skill for a user
 */
export async function unlockSkill(
  skillId: number,
  userId: string,
  context?: Record<string, any>
) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    // 1. Check if skill exists
    const [skill] = await db.select().from(skills).where(eq(skills.id, skillId));

    if (!skill) {
      return {
        success: false,
        error: "SKILL_NOT_FOUND",
        message: "技能不存在",
      };
    }

    // 2. Check if already unlocked
    const existing = await db
      .select()
      .from(userSkillProgress)
      .where(
        and(
          eq(userSkillProgress.userId, userId),
          eq(userSkillProgress.skillId, skillId)
        )
      );

    if (existing.length > 0) {
      return {
        success: false,
        alreadyUnlocked: true,
        unlockedAt: existing[0].unlockedAt.toISOString(),
        message: "该技能已解锁",
      };
    }

    // 3. Check dependencies
    const deps = await db
      .select()
      .from(skillDependencies)
      .where(eq(skillDependencies.targetSkillId, skillId));

    const unmetDependencies: Array<{ skillId: number; name: string }> = [];

    for (const dep of deps) {
      const [parentSkill] = await db
        .select()
        .from(skills)
        .where(eq(skills.id, dep.sourceSkillId));

      const unlocked = await db
        .select()
        .from(userSkillProgress)
        .where(
          and(
            eq(userSkillProgress.userId, userId),
            eq(userSkillProgress.skillId, dep.sourceSkillId)
          )
        );

      if (unlocked.length === 0) {
        unmetDependencies.push({
          skillId: dep.sourceSkillId,
          name: parentSkill?.name || "",
        });
      }
    }

    // 4. Check unlock conditions
    const rawConditions = await db
      .select()
      .from(skillUnlockConditions)
      .where(eq(skillUnlockConditions.skillId, skillId));

    const conditionsWithProgress =
      rawConditions.length > 0
        ? await calculateConditionProgress(userId, rawConditions)
        : [];

    const unmetConditions = conditionsWithProgress.filter((c) => !c.isMet);

    // 5. If any dependencies or conditions not met, return error
    if (unmetDependencies.length > 0 || unmetConditions.length > 0) {
      return {
        success: false,
        error: "CONDITIONS_NOT_MET",
        message: "无法解锁技能：前置条件未满足",
        details: {
          unmetConditions: unmetConditions.map((c) => ({
            type: c.type,
            description: c.description,
            currentProgress: c.currentProgress,
            requiredCount: c.requiredCount,
          })),
          unmetDependencies,
        },
      };
    }

    // 6. All checks passed - unlock the skill
    const [unlocked] = await db
      .insert(userSkillProgress)
      .values({
        userId,
        skillId,
        unlockContext: context || {},
      })
      .returning();

    // 7. Get next unlockable skills
    const allDeps = await db.select().from(skillDependencies);
    const userUnlockedSkills = await getUserUnlockedSkills(userId);
    const unlockedIds = new Set([
      ...userUnlockedSkills.map((s) => s.skillId),
      skillId,
    ]);

    const nextSkills = await Promise.all(
      allDeps
        .filter((d) => d.sourceSkillId === skillId)
        .map(async (d) => {
          const [nextSkill] = await db!
            .select()
            .from(skills)
            .where(eq(skills.id, d.targetSkillId));

          // Check if all deps of next skill are met
          const nextDeps = await db!
            .select()
            .from(skillDependencies)
            .where(eq(skillDependencies.targetSkillId, d.targetSkillId));

          const canUnlock = nextDeps.every((nd) =>
            unlockedIds.has(nd.sourceSkillId)
          );

          return {
            id: d.targetSkillId,
            name: nextSkill?.name || "",
            canUnlock,
          };
        })
    );

    return {
      success: true,
      unlocked: true,
      skill: {
        id: skill.id,
        name: skill.name,
        unlockedAt: unlocked.unlockedAt.toISOString(),
      },
      rewards: {
        exp: 50, // TODO: Make this configurable or calculate based on skill level
        message: "恭喜解锁新技能！",
      },
      nextSkills,
    };
  } catch (error) {
    console.error("Error unlocking skill:", error);
    throw error;
  }
}

/**
 * Get detailed information about a specific skill
 */
export async function getSkillDetails(skillId: number, userId: string) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    // 1. Get the skill
    const [skill] = await db.select().from(skills).where(eq(skills.id, skillId));

    if (!skill) {
      return null;
    }

    // 2. Check if user has unlocked it
    const unlockedData = await db
      .select()
      .from(userSkillProgress)
      .where(
        and(
          eq(userSkillProgress.userId, userId),
          eq(userSkillProgress.skillId, skillId)
        )
      );

    const isUnlocked = unlockedData.length > 0;

    // 3. Get dependencies (parent skills)
    const deps = await db
      .select()
      .from(skillDependencies)
      .where(eq(skillDependencies.targetSkillId, skillId));

    const dependencies = await Promise.all(
      deps.map(async (dep) => {
        const [parentSkill] = await db!
          .select()
          .from(skills)
          .where(eq(skills.id, dep.sourceSkillId));

        const parentUnlocked = await db!
          .select()
          .from(userSkillProgress)
          .where(
            and(
              eq(userSkillProgress.userId, userId),
              eq(userSkillProgress.skillId, dep.sourceSkillId)
            )
          );

        return {
          skillId: dep.sourceSkillId,
          name: parentSkill?.name || "",
          isUnlocked: parentUnlocked.length > 0,
        };
      })
    );

    // 4. Get unlock conditions with progress
    let conditions: any[] = [];
    let canUnlock = true;
    let blockingReasons: string[] = [];

    if (!isUnlocked) {
      const rawConditions = await db
        .select()
        .from(skillUnlockConditions)
        .where(eq(skillUnlockConditions.skillId, skillId));

      if (rawConditions.length > 0) {
        conditions = await calculateConditionProgress(userId, rawConditions);

        // Check if all conditions are met
        const unmetConditions = conditions.filter((c) => !c.isMet);
        if (unmetConditions.length > 0) {
          canUnlock = false;
          blockingReasons.push(
            ...unmetConditions.map((c) => c.description)
          );
        }
      }

      // Check if all dependencies are unlocked
      const unmetDeps = dependencies.filter((d) => !d.isUnlocked);
      if (unmetDeps.length > 0) {
        canUnlock = false;
        blockingReasons.push(
          ...unmetDeps.map((d) => `需要先解锁：${d.name}`)
        );
      }
    } else {
      canUnlock = false; // Already unlocked
    }

    // 5. Build response
    const result: any = {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      position: skill.position,
      metadata: skill.metadata,
      isUnlocked,
      dependencies,
      canUnlock,
      blockingReasons,
    };

    if (isUnlocked && unlockedData[0]) {
      result.unlockedAt = unlockedData[0].unlockedAt.toISOString();
      result.unlockContext = unlockedData[0].unlockContext;
    }

    if (!isUnlocked && conditions.length > 0) {
      result.conditions = conditions;
    }

    return result;
  } catch (error) {
    console.error("Error getting skill details:", error);
    throw error;
  }
}

/**
 * Get complete skill tree with user progress
 */
export async function getSkillTreeWithProgress(userId: string) {
  if (!db) {
    throw new Error("Database not initialized");
  }

  try {
    // 1. Get all skills
    const allSkills = await db.select().from(skills).orderBy(skills.id);

    // 2. Get all dependencies
    const dependencies = await db.select().from(skillDependencies);

    // 3. Get user's unlocked skills
    const unlockedSkillsData = await getUserUnlockedSkills(userId);
    const unlockedSkillIds = new Set(unlockedSkillsData.map((s) => s.skillId));

    // 4. Get unlock conditions for all skills
    const allConditions = await db.select().from(skillUnlockConditions);

    // Group conditions by skill ID
    const conditionsBySkill = allConditions.reduce((acc, condition) => {
      if (!acc[condition.skillId]) {
        acc[condition.skillId] = [];
      }
      acc[condition.skillId].push(condition);
      return acc;
    }, {} as Record<number, typeof allConditions>);

    // 5. Build skill nodes with unlock status and conditions
    const skillNodes = await Promise.all(
      allSkills.map(async (skill) => {
        const isUnlocked = unlockedSkillIds.has(skill.id);
        const unlockedData = unlockedSkillsData.find((s) => s.skillId === skill.id);

        // Base skill data
        const skillNode: any = {
          id: skill.id,
          name: skill.name,
          description: skill.description,
          position: skill.position,
          metadata: skill.metadata,
          isUnlocked,
        };

        // Add unlock info if unlocked
        if (isUnlocked && unlockedData) {
          skillNode.unlockedAt = unlockedData.unlockedAt.toISOString();
          skillNode.unlockContext = unlockedData.unlockContext;
        }

        // Add conditions with progress if not unlocked
        if (!isUnlocked && conditionsBySkill[skill.id]) {
          const conditionsWithProgress = await calculateConditionProgress(
            userId,
            conditionsBySkill[skill.id]
          );
          skillNode.conditions = conditionsWithProgress;
        }

        return skillNode;
      })
    );

    // 6. Calculate user progress summary
    const totalSkills = allSkills.length;
    const unlockedSkillsCount = unlockedSkillIds.size;
    const progressPercentage = (unlockedSkillsCount / totalSkills) * 100;

    // Find next unlockable skills (all dependencies met, not yet unlocked)
    const nextUnlockableSkills = skillNodes
      .filter((skill) => {
        if (skill.isUnlocked) return false;

        // Check if all dependencies are unlocked
        const deps = dependencies.filter((d) => d.targetSkillId === skill.id);
        const allDepsUnlocked = deps.every((d) =>
          unlockedSkillIds.has(d.sourceSkillId)
        );

        return allDepsUnlocked;
      })
      .map((skill) => skill.id);

    return {
      skills: skillNodes,
      dependencies: dependencies.map((d) => ({
        sourceSkillId: d.sourceSkillId,
        targetSkillId: d.targetSkillId,
      })),
      userProgress: {
        totalSkills,
        unlockedSkills: unlockedSkillsCount,
        progressPercentage: Math.round(progressPercentage * 10) / 10,
        nextUnlockableSkills,
      },
    };
  } catch (error) {
    console.error("Error getting skill tree with progress:", error);
    throw error;
  }
}
