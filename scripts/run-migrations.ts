/**
 * Execute SQL migrations manually
 *
 * Usage: tsx scripts/run-migrations.ts [migration-file]
 * Example: tsx scripts/run-migrations.ts sql/35_create_90day_challenge_system.sql
 */

import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function executeMigration(filePath: string, sql: postgres.Sql) {
  console.log(`\n📄 Executing migration: ${filePath}`);

  try {
    // Read SQL file
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    if (!sqlContent.trim()) {
      console.log('⚠️  Empty SQL file, skipping');
      return;
    }

    // Execute entire SQL file at once
    console.log(`   Executing SQL...`);

    try {
      await sql.unsafe(sqlContent);
      console.log(`   ✅ Migration executed successfully`);
    } catch (error: any) {
      // Log error details
      console.error(`   ❌ Error executing migration:`, error.message);

      // Check if it's just "already exists" errors
      if (error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.code === '42P07' || // relation already exists
          error.code === '42710') { // duplicate object
        console.log(`   ⏭️  Migration skipped (objects already exist)`);
      } else {
        throw error;
      }
    }

    console.log(`✅ Migration completed: ${path.basename(filePath)}\n`);
  } catch (error: any) {
    console.error(`❌ Migration failed: ${error.message}\n`);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('❌ Usage: tsx scripts/run-migrations.ts <sql-file>');
    console.log('\nExample:');
    console.log('  tsx scripts/run-migrations.ts sql/35_create_90day_challenge_system.sql');
    process.exit(1);
  }

  const migrationFile = args[0];

  if (!fs.existsSync(migrationFile)) {
    console.error(`❌ File not found: ${migrationFile}`);
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in environment');
    process.exit(1);
  }

  console.log('🚀 Starting migration execution...');
  console.log(`   Database: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown'}`);

  // Create database connection
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });

  try {
    await executeMigration(migrationFile, sql);
    console.log('🎉 All migrations completed successfully!');
  } finally {
    await sql.end();
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
