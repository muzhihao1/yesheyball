/**
 * Data Migration Script: Clearance Score Conversion
 *
 * Purpose: Migrate clearance_score from old formula (0-100) to new formula (0-500)
 *
 * Old Formula (before 2025-01-17): Weighted average of 5 dimensions (max 100)
 * New Formula (after 2025-01-17): Simple sum of 5 dimensions (max 500)
 *
 * Migration Logic:
 * - Recalculate clearanceScore = accuracy + spin + positioning + power + strategy
 * - Only update users where clearanceScore doesn't match the sum (indicating old data)
 *
 * Idempotency: Safe to run multiple times - only updates incorrect values
 *
 * Usage:
 *   npx tsx server/scripts/migrateClearanceScore.ts
 */

// Load environment variables first
import * as dotenv from 'dotenv';
dotenv.config();

import { db } from "../db.js";
import { users } from "../../shared/schema.js";
import { eq, sql } from "drizzle-orm";

interface MigrationStats {
  totalUsers: number;
  usersChecked: number;
  usersMigrated: number;
  usersSkipped: number;
  errors: Array<{ userId: string; error: string }>;
}

/**
 * Main migration function
 */
async function migrateClearanceScores(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalUsers: 0,
    usersChecked: 0,
    usersMigrated: 0,
    usersSkipped: 0,
    errors: [],
  };

  try {
    console.log('🚀 Starting Clearance Score Migration...\n');

    // Check database connection
    if (!db) {
      throw new Error('❌ Database connection not available');
    }

    // Fetch all users with ability scores
    console.log('📊 Fetching all users...');
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      accuracyScore: users.accuracyScore,
      spinScore: users.spinScore,
      positioningScore: users.positioningScore,
      powerScore: users.powerScore,
      strategyScore: users.strategyScore,
      clearanceScore: users.clearanceScore,
    }).from(users);

    stats.totalUsers = allUsers.length;
    console.log(`✅ Found ${stats.totalUsers} users\n`);

    // Process each user
    for (const user of allUsers) {
      stats.usersChecked++;

      try {
        // Calculate correct clearance score (0-500)
        const correctClearanceScore =
          (user.accuracyScore || 0) +
          (user.spinScore || 0) +
          (user.positioningScore || 0) +
          (user.powerScore || 0) +
          (user.strategyScore || 0);

        const currentClearanceScore = user.clearanceScore || 0;

        // Check if migration is needed
        const needsMigration = currentClearanceScore !== correctClearanceScore;

        if (!needsMigration) {
          // User data is already correct
          stats.usersSkipped++;
          console.log(`⏭️  User ${user.id} (${user.email}): Already correct (${currentClearanceScore})`);
          continue;
        }

        // User needs migration
        console.log(`🔄 Migrating user ${user.id} (${user.email}):`);
        console.log(`   Old clearance: ${currentClearanceScore}`);
        console.log(`   New clearance: ${correctClearanceScore}`);
        console.log(`   Breakdown: ${user.accuracyScore}+${user.spinScore}+${user.positioningScore}+${user.powerScore}+${user.strategyScore}`);

        // Update the user's clearance score
        await db
          .update(users)
          .set({ clearanceScore: correctClearanceScore })
          .where(eq(users.id, user.id));

        stats.usersMigrated++;
        console.log(`✅ Successfully migrated user ${user.id}\n`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        stats.errors.push({
          userId: user.id,
          error: errorMessage,
        });
        console.error(`❌ Error migrating user ${user.id}:`, errorMessage);
      }
    }

    // Print final statistics
    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Statistics:');
    console.log('='.repeat(60));
    console.log(`Total users:       ${stats.totalUsers}`);
    console.log(`Users checked:     ${stats.usersChecked}`);
    console.log(`Users migrated:    ${stats.usersMigrated} ✅`);
    console.log(`Users skipped:     ${stats.usersSkipped} ⏭️`);
    console.log(`Errors:            ${stats.errors.length} ${stats.errors.length > 0 ? '❌' : '✅'}`);

    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      stats.errors.forEach(({ userId, error }) => {
        console.log(`   User ${userId}: ${error}`);
      });
    }

    console.log('='.repeat(60));
    console.log('\n✅ Migration completed!\n');

    return stats;

  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
    throw error;
  }
}

/**
 * Dry run mode - preview changes without applying them
 */
async function dryRunMigration(): Promise<void> {
  console.log('🔍 DRY RUN MODE - No changes will be made\n');

  if (!db) {
    throw new Error('❌ Database connection not available');
  }

  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    accuracyScore: users.accuracyScore,
    spinScore: users.spinScore,
    positioningScore: users.positioningScore,
    powerScore: users.powerScore,
    strategyScore: users.strategyScore,
    clearanceScore: users.clearanceScore,
  }).from(users);

  console.log(`📊 Total users: ${allUsers.length}\n`);

  let needsMigrationCount = 0;

  for (const user of allUsers) {
    const correctClearanceScore =
      (user.accuracyScore || 0) +
      (user.spinScore || 0) +
      (user.positioningScore || 0) +
      (user.powerScore || 0) +
      (user.strategyScore || 0);

    const currentClearanceScore = user.clearanceScore || 0;
    const needsMigration = currentClearanceScore !== correctClearanceScore;

    if (needsMigration) {
      needsMigrationCount++;
      console.log(`🔄 Would migrate user ${user.id} (${user.email}):`);
      console.log(`   Current: ${currentClearanceScore} → Correct: ${correctClearanceScore}`);
    }
  }

  console.log(`\n📊 Users needing migration: ${needsMigrationCount} / ${allUsers.length}`);
  console.log('✅ Dry run completed - no changes made\n');
}

/**
 * Script entry point
 */
async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  try {
    if (isDryRun) {
      await dryRunMigration();
    } else {
      const stats = await migrateClearanceScores();

      // Exit with error code if there were any errors
      if (stats.errors.length > 0) {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
