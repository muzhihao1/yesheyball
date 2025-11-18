/**
 * Fix script: Add missing training_type column to ninety_day_training_records table
 *
 * This script uses the postgres library to directly execute the ALTER TABLE statement
 * to add the missing training_type column that the application code expects.
 */

import postgres from 'postgres';
import 'dotenv/config';

async function fixTrainingTypeColumn() {
  console.log('🔧 Starting database fix: Add training_type column...\n');

  // Connect to database
  const sql = postgres(process.env.DATABASE_URL, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    // Step 1: Check if column already exists
    console.log('Step 1: Checking if training_type column exists...');
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'ninety_day_training_records'
      AND column_name = 'training_type'
    `;

    if (columnCheck.length > 0) {
      console.log('✅ Column training_type already exists!');
      await sql.end();
      return;
    }

    console.log('❌ Column training_type does not exist. Adding it now...\n');

    // Step 2: Add the column
    console.log('Step 2: Adding training_type column...');
    await sql`
      ALTER TABLE ninety_day_training_records
      ADD COLUMN training_type varchar(20) NOT NULL DEFAULT '系统'
    `;
    console.log('✅ Column added successfully!\n');

    // Step 3: Verify the column was added
    console.log('Step 3: Verifying column was added...');
    const verification = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'ninety_day_training_records'
      AND column_name = 'training_type'
    `;

    if (verification.length > 0) {
      console.log('✅ Verification successful!');
      console.log('Column details:', verification[0]);
    } else {
      console.error('❌ Verification failed - column not found!');
    }

    // Step 4: Check all columns in the table
    console.log('\nStep 4: All columns in ninety_day_training_records table:');
    const allColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ninety_day_training_records'
      ORDER BY ordinal_position
    `;
    console.table(allColumns);

  } catch (error) {
    console.error('❌ Error during database fix:', error);
    throw error;
  } finally {
    await sql.end();
    console.log('\n✅ Database connection closed.');
  }
}

// Run the fix
fixTrainingTypeColumn()
  .then(() => {
    console.log('\n🎉 Database fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Database fix failed:', error);
    process.exit(1);
  });
