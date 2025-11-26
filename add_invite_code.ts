import 'dotenv/config';
import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function addInviteCodeColumn() {
  try {
    console.log('Adding invite_code column to users table...');

    // Add invite_code column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS invite_code VARCHAR(16) UNIQUE
    `);

    console.log('✓ invite_code column added');

    // Add referred_by_user_id column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS referred_by_user_id VARCHAR
    `);

    console.log('✓ referred_by_user_id column added');

    // Add invited_count column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS invited_count INTEGER NOT NULL DEFAULT 0
    `);

    console.log('✓ invited_count column added');
    console.log('✓ All columns added successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error adding invite_code column:', error);
    process.exit(1);
  }
}

addInviteCodeColumn();
