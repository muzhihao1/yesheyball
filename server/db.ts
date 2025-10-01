import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema.js";

// Allow running without database in demo mode
export let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  // Create postgres client for Supabase connection with SSL
  const client = postgres(process.env.DATABASE_URL, {
    ssl: { rejectUnauthorized: false }, // Supabase SSL configuration
    max: 10, // Connection pool size
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 30, // Connection timeout in seconds
    connection: {
      application_name: 'waytoheyball'
    }
  });

  db = drizzle(client, { schema });
  console.log("Connected to database successfully");
} else {
  console.log("Running in demo mode without database (DATABASE_URL not set)");
}
