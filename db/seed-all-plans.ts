/**
 * Complete seed script for all specialized training plans
 * Adds 24 detailed training plans (3 per dojo × 8 dojos) to the database
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { specializedTrainingPlansV3 } from '../shared/schema.js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);

async function seed() {
  console.log('🌱 Starting to seed specialized training plans...');

  try {
    // Read the SQL file
    const sqlFilePath = join(__dirname, 'migrations', 'add_specialized_training_plans.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf-8');

    // Execute the SQL
    await sql(sqlContent);

    console.log('✅ Successfully seeded all 24 training plans!');
    console.log('\n📋 Training plans added by dojo:');
    console.log('  1. 基本功道场 (Basic Fundamentals) - 3 plans');
    console.log('  2. 发力训练营 (Power Control) - 3 plans');
    console.log('  3. 准度射击场 (Accuracy Shooting) - 3 plans');
    console.log('  4. 杆法实验室 (Cue Technique) - 3 plans');
    console.log('  5. 分离角计算器 (Separation Angle) - 3 plans');
    console.log('  6. 走位规划室 (Positioning Planning) - 3 plans');
    console.log('  7. 清台挑战赛 (Clearance Challenge) - 3 plans');
    console.log('  8. 五分点速成班 (Five-Point System) - 3 plans');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('\n✨ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });
