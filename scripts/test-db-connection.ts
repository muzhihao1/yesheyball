/**
 * Simple database connection test
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import { trainingLevels } from "../shared/schema.js";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

console.log("🔍 Testing database connection...");
console.log(`   URL: ${databaseUrl.replace(/:[^@]*@/, ':***@')}`);

try {
  const connection = neon(databaseUrl);
  const db = drizzle(connection);

  console.log("\n📊 Attempting to query training_levels table...");
  const levels = await db.select().from(trainingLevels).limit(5);

  console.log(`✅ Connection successful!`);
  console.log(`   Found ${levels.length} existing levels`);

  if (levels.length > 0) {
    console.log("\n📋 Existing levels:");
    levels.forEach(l => console.log(`   - Level ${l.levelNumber}: ${l.title}`));
  }

  process.exit(0);
} catch (error: any) {
  console.error("\n❌ Connection failed:", error.message);
  console.error(error);
  process.exit(1);
}
