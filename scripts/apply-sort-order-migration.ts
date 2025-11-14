/**
 * Apply sortOrder migration manually
 */

import "dotenv/config";
import { db } from "../server/db.js";
import { sql } from "drizzle-orm";

console.log("🔧 Applying sortOrder migration...\n");

async function applyMigration() {
  try {
    // Add sort_order column
    await db.execute(sql`
      ALTER TABLE specialized_trainings
      ADD COLUMN IF NOT EXISTS sort_order INTEGER;
    `);

    console.log("✅ Added sort_order column");

    // Create index
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_specialized_trainings_sort_order
      ON specialized_trainings(sort_order);
    `);

    console.log("✅ Created index on sort_order");

    console.log("\n✨ Migration applied successfully!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

applyMigration();
