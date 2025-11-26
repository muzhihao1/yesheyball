import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function checkSkills() {
  try {
    // Check if skills table exists
    const tables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'skills'
    `);

    console.log('Skills table exists:', tables.length > 0);

    if (tables.length > 0) {
      // Get row count
      const count = await db.execute(sql`SELECT COUNT(*) as count FROM skills`);
      console.log('Skills table row count:', count[0].count);

      // Get sample data
      const rows = await db.execute(sql`
        SELECT id, skill_order, title
        FROM skills
        ORDER BY skill_order
        LIMIT 15
      `);
      console.log('\nSkills data:');
      rows.forEach((row: any) => {
        console.log(`  ID: ${row.id}, Order: ${row.skill_order}, Title: ${row.title || 'N/A'}`);
      });

      // Check for duplicates
      const duplicates = await db.execute(sql`
        SELECT skill_order, COUNT(*) as count
        FROM skills
        GROUP BY skill_order
        HAVING COUNT(*) > 1
      `);

      if (duplicates.length > 0) {
        console.log('\n⚠️  DUPLICATE skill_order values found:');
        duplicates.forEach((dup: any) => {
          console.log(`  Order ${dup.skill_order}: ${dup.count} rows`);
        });
        console.log('\n❌ NOT SAFE - Need to fix duplicates first');
      } else {
        console.log('\n✅ No duplicates - SAFE TO ADD UNIQUE CONSTRAINT');
      }
    } else {
      console.log('\n✅ Table does not exist - Constraint will be added during table creation');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkSkills();
