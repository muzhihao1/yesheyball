import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from "../shared/schema.js";

// Allow running without database in demo mode
export let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  // @vercel/postgres automatically uses DATABASE_URL from environment
  db = drizzle(sql, { schema });
} else {
  console.log("Running in demo mode without database (DATABASE_URL not set)");
}
