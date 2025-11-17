/**
 * Create specialized_training table directly
 * Run with: npx tsx server/scripts/createSpecializedTrainingTable.ts
 */

import 'dotenv/config';
import { db } from '../db.js';
import { sql } from 'drizzle-orm';

async function createTable() {
  try {
    console.log('Creating specialized_training table...');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS specialized_training (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        training_method TEXT,
        evaluation_criteria JSONB DEFAULT '{}',
        related_tencore_skills JSONB DEFAULT '[]',
        difficulty VARCHAR(10),
        estimated_duration INTEGER DEFAULT 30,
        order_index INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);

    console.log('✅ Table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createTable();
