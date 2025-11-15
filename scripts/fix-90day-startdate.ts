/**
 * Data Cleanup Script: Fix 90-day challenge startDate inconsistencies
 *
 * Problem: Previous version of initializeUserNinetyDayProgress() automatically
 * set startDate during record creation. This caused issues where users had
 * startDate set without explicitly starting the challenge.
 *
 * Solution: Clear startDate for users who have:
 * 1. A startDate set in user_ninety_day_progress
 * 2. Zero completed days (haven't actually started training)
 * 3. No training records (never submitted a training session)
 *
 * Usage: npx tsx scripts/fix-90day-startdate.ts
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { userNinetyDayProgress, ninetyDayTrainingRecords } from '../shared/schema.js';
import { eq, and, isNotNull, sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixStartDates() {
  console.log('🚀 Starting 90-day challenge startDate cleanup...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in environment');
    process.exit(1);
  }

  // Create database connection
  const sqlClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sqlClient);

  try {
    // Get all progress records that have a startDate
    const progressRecords = await db
      .select()
      .from(userNinetyDayProgress)
      .where(isNotNull(userNinetyDayProgress.startDate));

    console.log(`📊 Found ${progressRecords.length} users with startDate set\n`);

    let clearedCount = 0;
    let keptCount = 0;
    let errorCount = 0;

    for (const progress of progressRecords) {
      try {
        // Check completed days count
        const completedDays = Array.isArray(progress.completedDays)
          ? progress.completedDays.length
          : 0;

        // Check if user has any training records using raw count query
        const [result] = await db.execute(
          sql`SELECT COUNT(*) as count FROM ninety_day_training_records WHERE user_id = ${progress.userId}`
        );
        const trainingRecordCount = Number(result?.count || 0);

        // Clear startDate if:
        // 1. No training records AND
        // 2. Zero completed days
        if (trainingRecordCount === 0 && completedDays === 0) {
          await db
            .update(userNinetyDayProgress)
            .set({
              startDate: null,
              estimatedCompletionDate: null,
            })
            .where(eq(userNinetyDayProgress.userId, progress.userId));

          console.log(`✅ Cleared startDate for user: ${progress.userId} (no activity)`);
          clearedCount++;
        } else {
          console.log(
            `⏭️  Kept startDate for user: ${progress.userId} ` +
            `(${trainingRecordCount} training records, ${completedDays} completed days)`
          );
          keptCount++;
        }
      } catch (error: any) {
        console.error(`❌ Error processing user ${progress.userId}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Cleanup complete!');
    console.log(`   - Cleared: ${clearedCount} records (inactive users)`);
    console.log(`   - Kept: ${keptCount} records (active users)`);
    console.log(`   - Errors: ${errorCount} records`);
    console.log(`   - Total processed: ${progressRecords.length} users\n`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    await sqlClient.end();
    process.exit(1);
  }

  // Close database connection
  await sqlClient.end();
}

fixStartDates()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
