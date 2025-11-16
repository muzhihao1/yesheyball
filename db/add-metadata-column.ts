import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function addColumn() {
  try {
    console.log('Adding metadata column...');
    await sql`
      ALTER TABLE specialized_training_plans 
      ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb
    `;
    console.log('✅ Successfully added metadata column');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addColumn().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
