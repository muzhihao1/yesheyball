/**
 * User Stats Service
 *
 * Unified service for updating user statistics across multiple training systems.
 * This ensures data consistency by merging data from:
 * - Skills Library system (training_sessions table)
 * - 90-Day Challenge system (ninety_day_training_records table)
 *
 * Key Functions:
 * - updateUserStats(): Update user.streak and user.totalDays from merged training data
 * - calculateTrainingStreak(): Calculate current and longest streak
 *
 * Usage:
 * Call updateUserStats(userId) after any training completion to ensure real-time sync.
 */

import { db } from "./db.js";
import { users, trainingSessions, ninetyDayTrainingRecords } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { storage } from "./storage.js";

/**
 * Training session data structure (unified format)
 */
interface UnifiedTrainingSession {
  createdAt: Date;
  source: 'skills_library' | 'ninety_day_challenge';
}

/**
 * Streak calculation result
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  recentDays: Array<{ date: string; count: number }>;
}

/**
 * Calculate training streak from session data
 *
 * Algorithm:
 * 1. Group sessions by date (YYYY-MM-DD)
 * 2. Sort dates in descending order
 * 3. Calculate current streak (consecutive days from today/yesterday)
 * 4. Calculate longest streak in history
 *
 * @param sessions - Array of training sessions from multiple systems
 * @returns Streak statistics
 */
export function calculateTrainingStreak(sessions: UnifiedTrainingSession[]): StreakData {
  if (sessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      recentDays: [],
    };
  }

  // Group sessions by date (YYYY-MM-DD format)
  const dateGroups = new Map<string, number>();

  for (const session of sessions) {
    const dateStr = new Date(session.createdAt).toISOString().split('T')[0];
    dateGroups.set(dateStr, (dateGroups.get(dateStr) || 0) + 1);
  }

  // Get all unique training dates and sort descending
  const uniqueDates = Array.from(dateGroups.keys()).sort((a, b) => b.localeCompare(a));
  const totalDays = uniqueDates.length;

  // Calculate current streak (consecutive days from today or yesterday)
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
    let checkDate = uniqueDates.includes(today) ? today : yesterday;
    let currentIndex = uniqueDates.indexOf(checkDate);

    while (currentIndex < uniqueDates.length) {
      const expectedDate = new Date(checkDate);
      const actualDate = uniqueDates[currentIndex];

      if (expectedDate.toISOString().split('T')[0] === actualDate) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
        checkDate = expectedDate.toISOString().split('T')[0];
        currentIndex++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak in history
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const nextDate = new Date(uniqueDates[i + 1]);
    const dayDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  // Get recent 7 days for UI display
  const recentDays: Array<{ date: string; count: number }> = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    recentDays.push({
      date: dateStr,
      count: dateGroups.get(dateStr) || 0,
    });
  }

  return {
    currentStreak,
    longestStreak,
    totalDays,
    recentDays: recentDays.reverse(),
  };
}

/**
 * Update user statistics (streak, totalDays) from merged training data
 *
 * This function should be called after any training completion to ensure
 * real-time synchronization of user statistics.
 *
 * @param userId - User ID to update stats for
 * @returns Updated streak data
 * @throws Error if database is not available or user not found
 */
export async function updateUserStats(userId: string): Promise<StreakData> {
  if (!db) {
    throw new Error('Database connection not available');
  }

  console.log(`📊 Updating stats for user ${userId}...`);

  // 1. Fetch training sessions from Skills Library system
  const skillsSessions = await storage.getUserTrainingSessions(userId);
  const completedSkillsSessions = skillsSessions.filter(s => s.completed);

  // 2. Fetch training records from 90-Day Challenge system
  const ninetyDaySessions = await db
    .select({
      id: ninetyDayTrainingRecords.id,
      userId: ninetyDayTrainingRecords.userId,
      dayNumber: ninetyDayTrainingRecords.dayNumber,
      completedAt: ninetyDayTrainingRecords.completedAt,
    })
    .from(ninetyDayTrainingRecords)
    .where(eq(ninetyDayTrainingRecords.userId, userId));

  // 3. Merge into unified format
  const allSessions: UnifiedTrainingSession[] = [
    // Skills Library sessions
    ...completedSkillsSessions.map(s => ({
      createdAt: s.createdAt,
      source: 'skills_library' as const,
    })),
    // 90-Day Challenge sessions
    ...ninetyDaySessions.map(s => ({
      createdAt: s.completedAt,
      source: 'ninety_day_challenge' as const,
    })),
  ];

  console.log(`📊 Found ${completedSkillsSessions.length} skills sessions + ${ninetyDaySessions.length} 90-day sessions`);

  // 4. Calculate streak data
  const streakData = calculateTrainingStreak(allSessions);

  console.log(`📊 Calculated streak: current=${streakData.currentStreak}, longest=${streakData.longestStreak}, total=${streakData.totalDays}`);

  // 5. Update user record
  await db
    .update(users)
    .set({
      streak: streakData.currentStreak,
      totalDays: streakData.totalDays,
      lastActiveAt: new Date(),
    })
    .where(eq(users.id, userId));

  console.log(`✅ User ${userId} stats updated successfully`);

  return streakData;
}

/**
 * Get current streak data without updating database
 *
 * Useful for read-only operations like displaying stats.
 *
 * @param userId - User ID to get stats for
 * @returns Current streak data
 */
export async function getUserStreakData(userId: string): Promise<StreakData> {
  if (!db) {
    throw new Error('Database connection not available');
  }

  // Fetch from both systems
  const skillsSessions = await storage.getUserTrainingSessions(userId);
  const completedSkillsSessions = skillsSessions.filter(s => s.completed);

  const ninetyDaySessions = await db
    .select({
      completedAt: ninetyDayTrainingRecords.completedAt,
    })
    .from(ninetyDayTrainingRecords)
    .where(eq(ninetyDayTrainingRecords.userId, userId));

  // Merge and calculate
  const allSessions: UnifiedTrainingSession[] = [
    ...completedSkillsSessions.map(s => ({
      createdAt: s.createdAt,
      source: 'skills_library' as const,
    })),
    ...ninetyDaySessions.map(s => ({
      createdAt: s.completedAt,
      source: 'ninety_day_challenge' as const,
    })),
  ];

  return calculateTrainingStreak(allSessions);
}
