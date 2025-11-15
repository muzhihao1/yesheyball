/**
 * Test script: Clear startDate for demo user to simulate fresh user
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { userNinetyDayProgress } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

async function clearStartDate() {
  console.log('🧪 Clearing startDate for demo user...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  try {
    await db
      .update(userNinetyDayProgress)
      .set({
        startDate: null,
        estimatedCompletionDate: null,
      })
      .where(eq(userNinetyDayProgress.userId, 'demo-user'));

    console.log('✅ Cleared startDate for demo-user');
    console.log('📝 Now refresh the page - welcome modal should appear\n');
  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    process.exit(1);
  }

  await sql.end();
}

clearStartDate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
