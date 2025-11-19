/**
 * Backfill Training Stats Script
 *
 * This script recalculates and updates training statistics for all users:
 * - Current streak (consecutive training days from today/yesterday)
 * - Longest streak (historical best)
 * - Total days (unique training days across all systems)
 *
 * Run this once after adding the longest_streak field to the database.
 *
 * Usage:
 *   npx tsx server/scripts/backfill-training-stats.ts
 */

import "dotenv/config";
import { db } from "../db.js";
import { users } from "../../shared/schema.js";
import { updateUserStats } from "../userStatsService.js";

async function backfillTrainingStats() {
  try {
    console.log("📊 Starting training stats backfill...\n");

    if (!db) {
      console.error("❌ Database connection not available");
      console.error("Please ensure DATABASE_URL is set in your environment variables");
      process.exit(1);
    }

    // Get all users
    const allUsers = await db.select({ id: users.id }).from(users);
    console.log(`Found ${allUsers.length} users to process\n`);

    if (allUsers.length === 0) {
      console.log("No users found in database");
      process.exit(0);
    }

    // Process each user
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      const progress = `[${i + 1}/${allUsers.length}]`;

      try {
        console.log(`${progress} Processing user: ${user.id}`);

        // Update user stats (calculates and saves streak, longestStreak, totalDays)
        const stats = await updateUserStats(user.id);

        console.log(`${progress} ✅ Updated - Current: ${stats.currentStreak}, Longest: ${stats.longestStreak}, Total: ${stats.totalDays}\n`);

        successCount++;
      } catch (error) {
        console.error(`${progress} ❌ Failed to update user ${user.id}:`, error);
        errorCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Backfill Summary:");
    console.log("=".repeat(60));
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Successful: ${successCount} ✅`);
    console.log(`Failed: ${errorCount} ❌`);
    console.log("=".repeat(60) + "\n");

    if (errorCount === 0) {
      console.log("✅ All users updated successfully!");
    } else {
      console.log("⚠️  Some users failed to update. Check the logs above for details.");
    }

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Fatal error during backfill:", error);
    process.exit(1);
  }
}

// Run the script
backfillTrainingStats();
