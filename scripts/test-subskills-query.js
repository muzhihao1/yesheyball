/**
 * Test sub-skills query directly
 */
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

const db = postgres(DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 1,
  connect_timeout: 30,
  prepare: false
});

try {
  console.log('Testing sub-skills query for skill_1...\n');

  const result = await db`
    SELECT * FROM sub_skills
    WHERE skill_id = 'skill_1'
    AND is_active = true
    ORDER BY sub_skill_order
  `;

  console.log(`Found ${result.length} sub-skills:`);
  console.table(result.map(r => ({
    id: r.id,
    title: r.title,
    order: r.sub_skill_order
  })));

} catch (error) {
  console.error('❌ Query failed:', error);
} finally {
  await db.end();
}
