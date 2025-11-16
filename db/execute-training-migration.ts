/**
 * Execute specialized training plans migration
 * Adds all 24 training plans to the database
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

console.log('🔗 Connecting to database...');
const sql = neon(DATABASE_URL);

async function executeMigration() {
  console.log('🌱 Starting specialized training plans migration...\n');

  try {
    // Read the V2 SQL file
    const sqlFilePath = join(__dirname, 'migrations', 'specialized_training_plans_v2.sql');
    console.log(`📖 Reading migration file: ${sqlFilePath}`);

    const sqlContent = readFileSync(sqlFilePath, 'utf-8');

    console.log('✨ Executing migration SQL...\n');

    // Execute the SQL
    await sql(sqlContent);

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Added 24 training plans across 8 dojos:\n');

    const dojos = [
      { id: 'st_basic', name: '基本功训练道场', plans: ['站位与姿势', '握杆与手架', '出杆精准度'] },
      { id: 'st_accuracy', name: '准度训练道场', plans: ['直线球练习', '角度球练习', '贴库球与翻袋'] },
      { id: 'st_spin', name: '杆法训练道场', plans: ['基础杆法', '加塞练习', '高级杆法'] },
      { id: 'st_positioning', name: '走位训练道场', plans: ['分离角练习', '叫位练习', 'K球与蛇彩'] },
      { id: 'st_power', name: '发力训练道场', plans: ['空杆与力量控制', '发力节奏', '实战发力'] },
      { id: 'st_angle', name: '策略训练道场', plans: ['清台思路', '防守练习', '特殊球形'] },
      { id: 'st_clearance', name: '清台挑战道场', plans: ['顺序清彩', '乱序清彩', '计时清彩'] },
      { id: 'st_five_points', name: '五分点训练道场', plans: ['五分点叫位', '五分点发散', '五分点实战'] },
    ];

    dojos.forEach((dojo, index) => {
      console.log(`${index + 1}. ${dojo.name} (${dojo.id})`);
      dojo.plans.forEach((plan, idx) => {
        const level = idx === 0 ? '入门' : idx === 1 ? '进阶' : '大师';
        console.log(`   ${level}: ${plan}`);
      });
      console.log();
    });

    console.log('🎯 Training system features:');
    console.log('   • Three difficulty levels: 入门 → 进阶 → 大师');
    console.log('   • Clear evaluation standards for each plan');
    console.log('   • Structured practice: sets × reps');
    console.log('   • XP rewards: 20-60 points per session');
    console.log('   • Time estimates: 30-60 minutes\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

executeMigration()
  .then(() => {
    console.log('✨ All done! Training plans are ready for use.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed with error:', error.message);
    process.exit(1);
  });
