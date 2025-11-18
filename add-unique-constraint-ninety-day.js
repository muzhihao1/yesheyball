/**
 * Database Migration Script
 * Adds unique constraint to ninety_day_training_records table
 * to prevent duplicate submissions for the same user and day
 *
 * Run with: node add-unique-constraint-ninety-day.js
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function addUniqueConstraint() {
  const sql = postgres(DATABASE_URL);

  try {
    console.log('🔧 Starting database migration...');
    console.log('📋 Adding unique constraint to ninety_day_training_records table');

    // Check if constraint already exists
    const existingConstraints = await sql`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'ninety_day_training_records'
        AND constraint_type = 'UNIQUE'
        AND constraint_name = 'unique_user_day';
    `;

    if (existingConstraints.length > 0) {
      console.log('✅ Unique constraint already exists, skipping...');
      await sql.end();
      return;
    }

    // Add unique constraint on (user_id, day_number)
    await sql`
      ALTER TABLE ninety_day_training_records
      ADD CONSTRAINT unique_user_day UNIQUE (user_id, day_number);
    `;

    console.log('✅ Successfully added unique constraint: unique_user_day (user_id, day_number)');
    console.log('   This prevents users from submitting duplicate records for the same day.');

    // Verify the constraint was added
    const verification = await sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'ninety_day_training_records'
        AND constraint_name = 'unique_user_day';
    `;

    if (verification.length > 0) {
      console.log('✅ Verification passed: Constraint is active');
    } else {
      console.error('⚠️  Warning: Could not verify constraint');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    // Check if error is due to existing duplicate data
    if (error.code === '23505' || error.message.includes('duplicate key')) {
      console.error('\n⚠️  ERROR: Duplicate records exist in the database.');
      console.error('   You need to clean up duplicate records before adding the constraint.');
      console.error('\n   Run this query to find duplicates:');
      console.error('   SELECT user_id, day_number, COUNT(*) FROM ninety_day_training_records');
      console.error('   GROUP BY user_id, day_number HAVING COUNT(*) > 1;');
    }

    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run migration
addUniqueConstraint()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  });
