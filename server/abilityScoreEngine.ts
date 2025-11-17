/**
 * Ability Score Calculation Engine (能力分计算引擎)
 *
 * Calculates 5-dimensional ability scores based on training records:
 * - Accuracy Score (准度分): Based on success rate
 * - Spin Score (杆法分): Based on difficulty-weighted completion
 * - Positioning Score (走位分): Based on difficulty-weighted completion
 * - Power Score (发力分): Based on difficulty-weighted completion
 * - Strategy Score (策略分): Based on difficulty-weighted completion
 * - Clearance Score (清台能力总分): Weighted average of all 5 dimensions
 */

import { db } from "./db.js";
import { users, ninetyDayCurriculum, ninetyDayTrainingRecords } from "../shared/schema.js";
import { eq, and, sql as rawSql } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

export interface TrainingStats {
  total_attempts?: number;
  successful_shots?: number;
  completed_count?: number;
  target_count?: number;
  duration_minutes?: number;
  [key: string]: any;
}

export interface ScoreChanges {
  accuracy?: number;
  spin?: number;
  positioning?: number;
  power?: number;
  strategy?: number;
  clearance?: number;
}

export interface AbilityScores {
  accuracy_score: number;
  spin_score: number;
  positioning_score: number;
  power_score: number;
  strategy_score: number;
  clearance_score: number;
}

export interface TrainingSubmission {
  user_id: string;
  day_number: number;
  training_stats: TrainingStats;
  duration_minutes: number;
  notes?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Difficulty multipliers for calculating difficulty points
 */
export const DIFFICULTY_MULTIPLIERS = {
  '初级': 1.0,
  '中级': 1.5,
  '高级': 2.0,
} as const;

/**
 * Clearance score weights (五维能力加权)
 * Total: 100%
 */
export const CLEARANCE_WEIGHTS = {
  accuracy: 0.30,    // 30%
  spin: 0.20,        // 20%
  positioning: 0.25, // 25%
  power: 0.15,       // 15%
  strategy: 0.10,    // 10%
} as const;

/**
 * Primary skill dimension mapping
 */
export type AbilityDimension = 'accuracy' | 'spin' | 'positioning' | 'power' | 'strategy';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get difficulty multiplier for a given difficulty level
 */
export function getDifficultyMultiplier(difficulty: string): number {
  return DIFFICULTY_MULTIPLIERS[difficulty as keyof typeof DIFFICULTY_MULTIPLIERS] || 1.0;
}

/**
 * Calculate accuracy score (准度分)
 * Formula: (successful_shots / total_shots) * 100
 */
export function calculateAccuracyScore(
  totalShots: number,
  successfulShots: number
): number {
  if (totalShots === 0) return 0;
  return Math.round((successfulShots / totalShots) * 100);
}

/**
 * Calculate skill score for spin/positioning/power/strategy (杆法/走位/发力/策略分)
 * Formula: (completed_difficulty_points / total_difficulty_points) * 100
 */
export function calculateSkillScore(
  totalDifficultyPoints: number,
  completedDifficultyPoints: number
): number {
  if (totalDifficultyPoints === 0) return 0;
  return Math.round((completedDifficultyPoints / totalDifficultyPoints) * 100);
}

/**
 * Calculate clearance score (清台能力总分)
 * Formula: Weighted average of 5 dimensions
 */
export function calculateClearanceScore(scores: AbilityScores): number {
  const weightedSum =
    scores.accuracy_score * CLEARANCE_WEIGHTS.accuracy +
    scores.spin_score * CLEARANCE_WEIGHTS.spin +
    scores.positioning_score * CLEARANCE_WEIGHTS.positioning +
    scores.power_score * CLEARANCE_WEIGHTS.power +
    scores.strategy_score * CLEARANCE_WEIGHTS.strategy;

  return Math.round(weightedSum);
}

/**
 * Calculate score change for a single training session
 * Returns the points gained in this session
 */
export function calculateSessionScoreChange(
  scoringMethod: string,
  primarySkill: AbilityDimension,
  difficulty: string,
  trainingStats: TrainingStats
): { dimension: AbilityDimension; pointsGained: number; achievedTarget: boolean } {
  const multiplier = getDifficultyMultiplier(difficulty);
  let pointsGained = 0;
  let achievedTarget = false;

  if (scoringMethod === 'success_rate') {
    // For accuracy-based training
    const totalAttempts = trainingStats.total_attempts || 0;
    const successfulShots = trainingStats.successful_shots || 0;

    if (totalAttempts > 0) {
      const successRate = successfulShots / totalAttempts;
      // Award points based on success rate and difficulty
      // Base: 10 points per successful shot, scaled by difficulty
      pointsGained = Math.round(successfulShots * 10 * multiplier);
      achievedTarget = successRate >= 0.7; // 70% success rate target
    }
  } else {
    // For completion-based training (spin, positioning, power, strategy)
    const completedCount = trainingStats.completed_count || 0;
    const targetCount = trainingStats.target_count || 1;

    // Award difficulty points based on completion percentage
    const completionRate = Math.min(completedCount / targetCount, 1.0);
    // Base: 100 points for full completion, scaled by difficulty
    pointsGained = Math.round(100 * completionRate * multiplier);
    achievedTarget = completionRate >= 0.8; // 80% completion target
  }

  return {
    dimension: primarySkill,
    pointsGained,
    achievedTarget,
  };
}

// ============================================================================
// Core Engine Functions
// ============================================================================

/**
 * Process a training record and update user ability scores
 *
 * This is the main entry point for score calculation.
 * It handles the entire workflow:
 * 1. Get curriculum info (difficulty, primary_skill, scoring_method)
 * 2. Calculate score change for this session
 * 3. Update user's cumulative raw data
 * 4. Recalculate all ability scores
 * 5. Insert training record with score changes
 */
export async function processTrainingRecord(
  submission: TrainingSubmission
): Promise<{ success: boolean; scoreChanges: ScoreChanges; newScores: AbilityScores }> {
  const { user_id, day_number, training_stats, duration_minutes, notes } = submission;

  if (!db) {
    throw new Error("Database not initialized");
  }

  // Start transaction
  return await db.transaction(async (tx) => {
    // 1. Get curriculum information
    const curriculum = await tx.execute(
      rawSql`
        SELECT primary_skill, difficulty, scoring_method
        FROM ninety_day_curriculum
        WHERE day_number = ${day_number}
        LIMIT 1
      `
    );

    if (!curriculum || curriculum.length === 0) {
      throw new Error(`Curriculum not found for day ${day_number}`);
    }

    const curriculumRow = curriculum[0] as Record<string, any>;
    const primarySkill = String(curriculumRow.primary_skill);
    const difficulty = String(curriculumRow.difficulty);
    const scoringMethod = String(curriculumRow.scoring_method);

    // 2. Calculate session score change
    const sessionResult = calculateSessionScoreChange(
      scoringMethod,
      primarySkill as AbilityDimension,
      difficulty,
      training_stats
    );

    // 3. Update user's raw cumulative data
    const { dimension, pointsGained, achievedTarget } = sessionResult;

    if (scoringMethod === 'success_rate') {
      // Update accuracy raw data
      const totalAttempts = training_stats.total_attempts || 0;
      const successfulShots = training_stats.successful_shots || 0;

      await tx.execute(
        rawSql`
          UPDATE users
          SET accuracy_total_shots = accuracy_total_shots + ${totalAttempts},
              accuracy_successful_shots = accuracy_successful_shots + ${successfulShots}
          WHERE id = ${user_id}
        `
      );
    } else {
      // Update difficulty points for the specific dimension
      const columnPrefix = `${dimension}_`;
      const totalPointsColumn = `${columnPrefix}total_difficulty_points`;
      const completedPointsColumn = `${columnPrefix}completed_difficulty_points`;

      await tx.execute(
        rawSql`
          UPDATE users
          SET ${rawSql.raw(totalPointsColumn)} = ${rawSql.raw(totalPointsColumn)} + ${100 * getDifficultyMultiplier(difficulty)},
              ${rawSql.raw(completedPointsColumn)} = ${rawSql.raw(completedPointsColumn)} + ${pointsGained}
          WHERE id = ${user_id}
        `
      );
    }

    // 4. Recalculate ALL ability scores from updated raw data
    const updatedUser = await tx.execute(
      rawSql`
        SELECT
          accuracy_total_shots, accuracy_successful_shots,
          spin_total_difficulty_points, spin_completed_difficulty_points,
          positioning_total_difficulty_points, positioning_completed_difficulty_points,
          power_total_difficulty_points, power_completed_difficulty_points,
          strategy_total_difficulty_points, strategy_completed_difficulty_points
        FROM users
        WHERE id = ${user_id}
        LIMIT 1
      `
    );

    if (!updatedUser || updatedUser.length === 0) {
      throw new Error(`User not found: ${user_id}`);
    }

    const userData = updatedUser[0] as Record<string, any>;

    // Calculate new scores
    const newAccuracyScore = calculateAccuracyScore(
      Number(userData.accuracy_total_shots) || 0,
      Number(userData.accuracy_successful_shots) || 0
    );

    const newSpinScore = calculateSkillScore(
      Number(userData.spin_total_difficulty_points) || 0,
      Number(userData.spin_completed_difficulty_points) || 0
    );

    const newPositioningScore = calculateSkillScore(
      Number(userData.positioning_total_difficulty_points) || 0,
      Number(userData.positioning_completed_difficulty_points) || 0
    );

    const newPowerScore = calculateSkillScore(
      Number(userData.power_total_difficulty_points) || 0,
      Number(userData.power_completed_difficulty_points) || 0
    );

    const newStrategyScore = calculateSkillScore(
      Number(userData.strategy_total_difficulty_points) || 0,
      Number(userData.strategy_completed_difficulty_points) || 0
    );

    const newScores: AbilityScores = {
      accuracy_score: newAccuracyScore,
      spin_score: newSpinScore,
      positioning_score: newPositioningScore,
      power_score: newPowerScore,
      strategy_score: newStrategyScore,
      clearance_score: 0, // Will be calculated next
    };

    // Calculate clearance score
    newScores.clearance_score = calculateClearanceScore(newScores);

    // 5. Update user's ability scores
    await tx.execute(
      rawSql`
        UPDATE users
        SET
          accuracy_score = ${newScores.accuracy_score},
          spin_score = ${newScores.spin_score},
          positioning_score = ${newScores.positioning_score},
          power_score = ${newScores.power_score},
          strategy_score = ${newScores.strategy_score},
          clearance_score = ${newScores.clearance_score}
        WHERE id = ${user_id}
      `
    );

    // 6. Calculate score changes (for display purposes)
    const scoreChanges: ScoreChanges = {
      [dimension]: pointsGained > 0 ? Math.ceil(pointsGained / 10) : 0, // Simplified display change
    };

    // Also update clearance score change
    scoreChanges.clearance = Math.round(scoreChanges[dimension]! * CLEARANCE_WEIGHTS[dimension]);

    // 7. Calculate success rate for the record
    let successRate: number | undefined;
    if (scoringMethod === 'success_rate') {
      const totalAttempts = training_stats.total_attempts || 0;
      const successfulShots = training_stats.successful_shots || 0;
      successRate = totalAttempts > 0 ? Math.round((successfulShots / totalAttempts) * 100) : undefined;
    }

    // 8. Insert training record
    await tx.execute(
      rawSql`
        INSERT INTO ninety_day_training_records (
          user_id, day_number, started_at, completed_at,
          duration_minutes, training_stats, success_rate,
          achieved_target, score_changes, notes
        )
        VALUES (
          ${user_id}, ${day_number}, NOW(), NOW(),
          ${duration_minutes}, ${JSON.stringify(training_stats)}::jsonb,
          ${successRate}, ${achievedTarget}, ${JSON.stringify(scoreChanges)}::jsonb,
          ${notes || null}
        )
      `
    );

    // 9. Update challenge progress (auto-advance to next day)
    // Only update if this is the current day being completed
    const progressUpdate = await tx.execute(
      rawSql`
        UPDATE users
        SET
          challenge_current_day = LEAST(challenge_current_day + 1, 90),
          challenge_completed_days = challenge_completed_days + 1
        WHERE id = ${user_id}
          AND challenge_current_day = ${day_number}
        RETURNING challenge_current_day, challenge_completed_days
      `
    );

    if (progressUpdate && progressUpdate.length > 0) {
      const progress = progressUpdate[0] as Record<string, any>;
      console.log(`✅ Updated challenge progress for user ${user_id}: Day ${day_number} completed → Now on Day ${progress.challenge_current_day} (Total completed: ${progress.challenge_completed_days})`);
    }

    return {
      success: true,
      scoreChanges,
      newScores,
    };
  });
}

/**
 * Get user's current ability scores
 */
export async function getUserAbilityScores(userId: string): Promise<AbilityScores | null> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const result = await db.execute(
    rawSql`
      SELECT
        accuracy_score, spin_score, positioning_score,
        power_score, strategy_score, clearance_score
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `
  );

  if (!result || result.length === 0) {
    return null;
  }

  const row = result[0] as Record<string, any>;
  return {
    accuracy_score: Number(row.accuracy_score) || 0,
    spin_score: Number(row.spin_score) || 0,
    positioning_score: Number(row.positioning_score) || 0,
    power_score: Number(row.power_score) || 0,
    strategy_score: Number(row.strategy_score) || 0,
    clearance_score: Number(row.clearance_score) || 0,
  };
}

/**
 * Get user's training history with score changes
 */
export async function getUserTrainingHistory(
  userId: string,
  limit: number = 30
): Promise<any[]> {
  if (!db) {
    throw new Error("Database not initialized");
  }

  const result = await db.execute(
    rawSql`
      SELECT
        ntr.id, ntr.day_number, ntr.started_at, ntr.completed_at,
        ntr.duration_minutes, ntr.training_stats, ntr.success_rate,
        ntr.achieved_target, ntr.score_changes, ntr.notes,
        ndc.title, ndc.difficulty, ndc.primary_skill
      FROM ninety_day_training_records ntr
      JOIN ninety_day_curriculum ndc ON ntr.day_number = ndc.day_number
      WHERE ntr.user_id = ${userId}
      ORDER BY ntr.completed_at DESC
      LIMIT ${limit}
    `
  );

  return result as any[];
}
