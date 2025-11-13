/**
 * Migration Runner Script
 *
 * Executes SQL migration files against production database
 */

import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Please provide migration file path as argument');
  console.error('Usage: node run-migration.js <migration-file.sql>');
  process.exit(1);
}

const migrationPath = path.resolve(__dirname, '..', migrationFile);

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

console.log(`📄 Reading migration file: ${migrationPath}`);
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log(`🔌 Connecting to database...`);
const db = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
});

try {
  console.log(`🚀 Executing migration...`);
  await db.unsafe(sql);
  console.log(`✅ Migration completed successfully!`);
} catch (error) {
  console.error(`❌ Migration failed:`, error);
  process.exit(1);
} finally {
  await db.end();
}
