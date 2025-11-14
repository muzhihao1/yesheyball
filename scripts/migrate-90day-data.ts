/**
 * Data Migration Script: Sync 90-day challenge data
 *
 * This script migrates existing 90-day challenge data from the users table
 * to the user_ninety_day_progress table.
 *
 * Usage: npx tsx scripts/migrate-90day-data.ts
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { users, userNinetyDayProgress } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrateData() {
  console.log('🚀 Starting 90-day challenge data migration...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in environment');
    process.exit(1);
  }

  // Create database connection
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  try {
    // Get all users who have started the challenge
    const allUsers = await db.select().from(users);
    console.log(`📊 Found ${allUsers.length} total users\n`);

    let migratedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of allUsers) {
      if (user.challengeStartDate) {
        try {
          // Validate date
          const startDate = new Date(user.challengeStartDate);
          if (isNaN(startDate.getTime())) {
            console.log(`⚠️  Skipping user ${user.id}: Invalid challengeStartDate`);
            skippedCount++;
            continue;
          }

          // Check if progress record exists
          const [existing] = await db
            .select()
            .from(userNinetyDayProgress)
            .where(eq(userNinetyDayProgress.userId, user.id))
            .limit(1);

          if (!existing) {
            // Create new progress record
            await db.insert(userNinetyDayProgress).values({
              userId: user.id,
              currentDay: user.challengeCurrentDay || 1,
              completedDays: [],
              tencoreProgress: {},
              specializedProgress: {},
              totalTrainingTime: 0,
              startDate: startDate,
              estimatedCompletionDate: new Date(
                startDate.getTime() + 90 * 24 * 60 * 60 * 1000
              ),
            });
            console.log(`✅ Created progress record for user: ${user.id} (${user.email || 'no email'})`);
            migratedCount++;
          } else if (!existing.startDate && user.challengeStartDate) {
            // Update existing record with missing startDate
            await db
              .update(userNinetyDayProgress)
              .set({
                startDate: startDate,
                currentDay: user.challengeCurrentDay || existing.currentDay,
                estimatedCompletionDate: new Date(
                  startDate.getTime() + 90 * 24 * 60 * 60 * 1000
                ),
              })
              .where(eq(userNinetyDayProgress.userId, user.id));
            console.log(`✅ Updated progress record for user: ${user.id} (${user.email || 'no email'})`);
            updatedCount++;
          } else {
            console.log(`⏭️  Skipped user: ${user.id} (already has complete data)`);
            skippedCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing user ${user.id}:`, error.message);
          skippedCount++;
        }
      }
    }

    console.log('\n🎉 Migration complete!');
    console.log(`   - Created: ${migratedCount} records`);
    console.log(`   - Updated: ${updatedCount} records`);
    console.log(`   - Skipped: ${skippedCount} records`);
    console.log(`   - Total processed: ${migratedCount + updatedCount + skippedCount} users with challenges\n`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sql.end();
    process.exit(1);
  }

  // Close database connection
  await sql.end();
}

migrateData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
