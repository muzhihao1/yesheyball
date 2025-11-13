import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema.js";

// Allow running without database in demo mode
export let db: ReturnType<typeof drizzle> | null = null;

// ⚠️ 临时修复：Vercel 环境变量未生效，使用硬编码的正确 URL
const databaseUrl = process.env.NODE_ENV === 'production'
  ? "postgresql://postgres.ksgksoeubyvkuwfpdhet:IEPELVaPJnBoDtHX@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
  : process.env.DATABASE_URL;

if (databaseUrl) {
  console.log(`Drizzle using database: ${databaseUrl?.substring(0, 50)}...`);

  // Create postgres client for Supabase connection with SSL
  // CRITICAL: For Vercel serverless, use minimal connection pool
  // Each serverless function instance creates its own pool
  // Using max: 1 prevents connection pool exhaustion
  const client = postgres(databaseUrl, {
    ssl: { rejectUnauthorized: false }, // Supabase SSL configuration
    max: 1, // IMPORTANT: Keep at 1 for serverless environments to prevent pool exhaustion
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Reduced timeout for faster failure detection
    max_lifetime: 60 * 30, // Close connections after 30 minutes (prevents stale connections)
    connection: {
      application_name: 'waytoheyball'
    },
    // Enable prepare: false for better compatibility with connection poolers
    prepare: false
  });

  db = drizzle(client, { schema });
  console.log("Connected to database successfully (serverless mode: max=1)");
} else {
  console.log("Running in demo mode without database (DATABASE_URL not set)");
}
